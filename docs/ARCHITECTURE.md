# Orbit Chat architecture

Orbit Chat is a multi-model AI chat application. Its domain is intentionally small;
most implementation complexity comes from coordinating authentication,
streaming model providers, Convex, and object storage.

## Responsibility flow

Normal HTTP requests follow one direction:

```text
Route -> Controller -> Application service -> Repository / integration
```

- A **route** maps a URL and method to one controller.
- A **controller** authenticates the actor, parses and validates HTTP input,
  calls one use case, and translates its outcome to HTTP.
- An **application service** describes what the application does in business
  language.
- A **repository** hides persistence. An integration adapter hides an external
  provider such as Groq or DigitalOcean Spaces.

Direct Convex subscriptions remain in the UI because they provide live query
updates. They are not routed through Next.js merely to imitate HTTP layering.

## Entities and relationships

```text
User 1 ------ * Thread 1 ------ * Message 1 ------ * Attachment
  |               |
  |               +---------- * SharedChat
  +-------------------------- * SharedChat (owner)
```

| Entity     | Logical ID     | Purpose                                        |
| ---------- | -------------- | ---------------------------------------------- |
| User       | `clerkId`      | Local mirror of a Clerk identity               |
| Thread     | `threadId`     | Conversation metadata and lifecycle            |
| Message    | `messageId`    | User, assistant, or system content in a thread |
| Attachment | `attachmentId` | Metadata for an image stored in Spaces         |
| SharedChat | `shareId`      | Public link configuration for a live thread    |

Relationships are stored with string logical IDs rather than Convex document
IDs. The schema has no true many-to-many relationship and therefore no
junction table. `messages.attachmentIds` is denormalized convenience data;
`attachments.messageId` remains the owning relationship. If images were ever
reusable across messages, a `messageAttachments(messageId, attachmentId)`
junction table would become appropriate.

## Tables and indexes

| Table         | Important indexes                               |
| ------------- | ----------------------------------------------- |
| `users`       | `byClerkId`                                     |
| `threads`     | `byUserId`, `byThreadId`, `byUserIdAndThreadId` |
| `messages`    | `byThreadId`, `byUserId`, `byMessageId`         |
| `attachments` | `byUserId`, `byMessageId`, `byAttachmentId`     |
| `sharedChats` | `byShareId`, `byOwnerId`, `byThreadId`          |

Convex schema validators enforce message/thread state values and model
parameters. Application services own state transitions and orchestration.

## HTTP routes

| Route                       | Controller                       | Use case                 |
| --------------------------- | -------------------------------- | ------------------------ |
| `POST /api/chat`            | `createChatCompletionController` | `completeChat`           |
| `POST /api/upload`          | `uploadImagesController`         | `uploadChatImages`       |
| `POST /api/thread/title`    | `nameThreadController`           | `nameThread`             |
| `POST /clerk-users-webhook` | Clerk webhook controller         | synchronize a Clerk user |

The Next.js route files contain no business behavior. Each exports the
controller assigned to that URL.

## Controllers

Controllers own HTTP-specific work:

- derive the authoritative user ID from Clerk rather than trusting JSON;
- turn unknown JSON or multipart data into typed use-case input;
- reject malformed input before invoking providers or persistence;
- convert known application errors to stable status codes and response shapes;
- convert a chat service outcome into an AI SDK stream or compatibility stream.

They do not know Convex queries, S3 commands, provider selection rules, or
conversation lifecycle details.

## Application services

### Complete a chat turn

`completeChat` reads as one use case:

```text
read the newest prompt
validate/select the generation provider
start the conversation turn atomically
generate text or an image
persist the assistant result
complete the assistant message
mark the message failed when generation fails
```

The atomic start mutation creates the thread when needed, inserts the completed
user message, reserves a `thinking` assistant message, and records input
attachments together.

### Upload chat images

`uploadChatImages`:

```text
validate the entire batch
store each image
roll back already-stored images if the batch fails
return public image metadata
```

All files are validated before the first write. File count, MIME family, size,
and storage-key safety are enforced in one place.

### Name a thread

`nameThread`:

```text
generate a concise title
wait for the asynchronously-created thread
verify that the actor owns it
persist the title
```

The retry is part of the use case because the UI intentionally starts title
generation independently from chat persistence.

## Repositories and integrations

- `server/chat/chat.repository.ts` exposes only the persistence operations the
  chat use case needs: start, complete, fail, and attach an image.
- `server/threads/thread.repository.ts` hides owned-thread lookup and rename.
- `server/infrastructure/image-storage.ts` owns S3-compatible configuration,
  upload, deletion, and public URL construction.
- `server/chat/chat-models.ts` owns model classification, provider selection,
  and provider-specific image generation.
- `server/threads/thread-title-generator.ts` owns Groq title generation.

These modules are deep enough to remove provider/database details from their
callers without introducing generic base repositories or speculative factories.

## Conservative improvements over the original

- The original project remains untouched in the parent directory.
- HTTP identity comes from Clerk, not a client-supplied `userId`.
- Unknown request bodies are validated without `any`.
- Missing provider credentials are detected before a pending turn is written.
- Assistant failures transition to `error`; successful replies complete their
  thread state through persistence logic.
- Provider objects are not cached by raw BYOK secret.
- Upload batches validate first, sanitize keys, cap count, and roll back writes.
- Generated attachments update both sides of the denormalized association.
- Thread deletion cascades through Convex attachment/share metadata.
- Private and expired share records cannot be read as public conversations.
- `/shared/*` is actually reachable without signing in.

## Interview summary

The project is implementation-heavy rather than domain-heavy. A useful short
description is:

> Orbit Chat is a Next.js and Convex AI chat application. A user owns threads, a
> thread owns messages, and messages own attachment metadata for objects stored
> in DigitalOcean Spaces. A chat request atomically persists the user turn and
> an assistant placeholder, chooses the requested model provider, streams text
> or stores a generated image, and then completes the placeholder. Clerk owns
> identity, while public share records expose a read-only view of live thread
> messages. The HTTP code is split into routes, controllers, readable use-case
> services, and narrow persistence/provider adapters.

The most valuable discussion topics are atomic turn creation, streaming versus
ordinary request/response, external provider isolation, object storage versus
database metadata, authenticated ownership, and failure-state consistency.
