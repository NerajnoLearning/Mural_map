# TypeScript

## Overview
TypeScript adds static typing to JavaScript, enabling better IDE support, earlier error detection, and improved code documentation. MuralMap uses TypeScript in strict mode throughout the entire application.

---

## Key Concepts Used in MuralMap

### 1. Type Definitions

**Database Types (`src/types/index.ts`):**
```typescript
export interface User {
  id: string
  email: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  title: string
  description: string | null
  artist: string | null
  location: string
  city: string | null
  country: string | null
  latitude: number
  longitude: number
  image_url: string
  visibility: 'public' | 'friends' | 'private'
  created_at: string
  updated_at: string

  // Relations (nullable because not always fetched)
  user?: User
  favorites?: Favorite[]
  comments?: Comment[]
  tags?: Tag[]
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  text: string
  created_at: string
  user?: User
}

export interface Notification {
  id: string
  user_id: string
  actor_id: string
  type: 'like' | 'comment' | 'follow' | 'collection_add'
  post_id: string | null
  read: boolean
  created_at: string
  actor?: User
  post?: Post
}
```

### 2. Type Guards

**Example from `useOfflineDrafts.ts`:**
```typescript
function isDraft(obj: any): obj is Draft {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string'
  )
}

// Usage
const data = await store.get(id)
if (isDraft(data)) {
  return data  // TypeScript knows this is a Draft
}
```

### 3. Generics

**Generic function example:**
```typescript
async function fetchData<T>(
  query: string,
  filter?: Record<string, any>
): Promise<T[]> {
  const { data, error } = await supabase
    .from(query)
    .select('*')
    .match(filter || {})

  if (error) throw error
  return data as T[]
}

// Usage
const posts = await fetchData<Post>('posts', { visibility: 'public' })
const users = await fetchData<User>('users', { id: userId })
```

### 4. Union Types

**Visibility options:**
```typescript
type Visibility = 'public' | 'friends' | 'private'

interface PostForm {
  title: string
  description: string
  visibility: Visibility  // Only these 3 values allowed
}
```

**Notification types:**
```typescript
type NotificationType = 'like' | 'comment' | 'follow' | 'collection_add'

interface Notification {
  type: NotificationType
  // ...
}
```

### 5. Optional Properties

**With question mark (`?`):**
```typescript
interface PostDetailProps {
  postId: string          // Required
  showActions?: boolean   // Optional, defaults to undefined
  onUpdate?: () => void   // Optional callback
}

// Usage
const props = defineProps<PostDetailProps>()
// props.postId is always defined
// props.showActions might be undefined
```

### 6. Nullable vs Undefined

**Explicit null handling:**
```typescript
interface User {
  display_name: string | null  // Can be null from database
  bio: string | null
}

// Type-safe null checks
const displayName = user.display_name || 'Anonymous'
const shortBio = user.bio?.substring(0, 100) || 'No bio'
```

### 7. Type Assertions

**When you know better than TypeScript:**
```typescript
// Careful - only use when you're certain
const post = data as Post

// Better - with type guard
if (isPost(data)) {
  // TypeScript knows data is Post here
  console.log(data.title)
}
```

### 8. Async/Await Types

**Promise return types:**
```typescript
async function fetchPost(id: string): Promise<Post | null> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data as Post
  } catch {
    return null
  }
}

// TypeScript knows the return type
const post = await fetchPost('123')  // post is Post | null
if (post) {
  console.log(post.title)  // Safe to access
}
```

---

## Common Patterns in MuralMap

### Pattern 1: Store Type Definitions

```typescript
// src/stores/posts.ts
export const usePostsStore = defineStore('posts', () => {
  const posts = ref<Post[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const currentPage = ref<number>(1)

  const fetchPosts = async (
    page: number = 1,
    limit: number = 20
  ): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      // Implementation
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  return {
    posts,
    loading,
    error,
    currentPage,
    fetchPosts
  }
})
```

### Pattern 2: Component Props with Defaults

```typescript
// Using withDefaults
const props = withDefaults(
  defineProps<{
    limit?: number
    sortBy?: 'recent' | 'popular'
    showFilters?: boolean
  }>(),
  {
    limit: 20,
    sortBy: 'recent',
    showFilters: true
  }
)

// All props now have guaranteed values
console.log(props.limit)  // Always a number (20 if not provided)
```

### Pattern 3: Event Emits with Types

```typescript
const emit = defineEmits<{
  (e: 'update', post: Post): void
  (e: 'delete', id: string): void
  (e: 'close'): void
}>()

// Usage
emit('update', updatedPost)  // TypeScript checks that post is a Post
emit('delete', postId)       // TypeScript checks that id is a string
emit('close')                // No arguments needed
```

### Pattern 4: Form Data Types

```typescript
interface CreatePostForm {
  title: string
  description: string
  artist: string
  location: string
  city: string
  country: string
  latitude: number
  longitude: number
  image: File | null
  tags: string[]
  visibility: Visibility
}

const form = reactive<CreatePostForm>({
  title: '',
  description: '',
  artist: '',
  location: '',
  city: '',
  country: '',
  latitude: 0,
  longitude: 0,
  image: null,
  tags: [],
  visibility: 'public'
})

// TypeScript ensures all fields match the interface
```

### Pattern 5: API Response Typing

```typescript
interface SupabaseResponse<T> {
  data: T | null
  error: Error | null
}

async function createPost(post: CreatePostForm): Promise<Post | null> {
  const { data, error }: SupabaseResponse<Post> = await supabase
    .from('posts')
    .insert([post])
    .select()
    .single()

  if (error) {
    console.error(error)
    return null
  }

  return data
}
```

### Pattern 6: Computed Types

```typescript
const authStore = useAuthStore()

// TypeScript infers the return type as ComputedRef<boolean>
const isAuthenticated = computed(() => {
  return authStore.user !== null
})

// Explicit typing for complex computed
const sortedPosts = computed<Post[]>(() => {
  return [...posts.value].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
})
```

---

## Advanced TypeScript Features

### 1. Utility Types

**Partial - Make all properties optional:**
```typescript
type PartialPost = Partial<Post>
// All Post properties are now optional

const updatePost = (id: string, updates: Partial<Post>) => {
  // Only pass the fields you want to update
}
```

**Pick - Select specific properties:**
```typescript
type PostPreview = Pick<Post, 'id' | 'title' | 'image_url' | 'user_id'>

const previews: PostPreview[] = posts.map(p => ({
  id: p.id,
  title: p.title,
  image_url: p.image_url,
  user_id: p.user_id
}))
```

**Omit - Exclude specific properties:**
```typescript
type PostWithoutTimestamps = Omit<Post, 'created_at' | 'updated_at'>
```

### 2. Intersection Types

```typescript
type PostWithUser = Post & {
  user: User
}

type PostWithEngagement = Post & {
  favoritesCount: number
  commentsCount: number
}

// Combine multiple types
type FullPost = Post & {
  user: User
  favorites: Favorite[]
  comments: Comment[]
  tags: Tag[]
}
```

### 3. Type Inference

```typescript
// TypeScript infers types automatically
const user = ref(null)  // Ref<null>
user.value = { id: '123', email: 'test@example.com' }  // Error!

// Better - explicit type
const user = ref<User | null>(null)
user.value = userData  // Works if userData is User
```

### 4. Discriminated Unions

```typescript
type UploadState =
  | { status: 'idle' }
  | { status: 'uploading', progress: number }
  | { status: 'success', url: string }
  | { status: 'error', message: string }

function handleUpload(state: UploadState) {
  switch (state.status) {
    case 'idle':
      // state has no extra properties
      break
    case 'uploading':
      // state.progress is available
      console.log(`${state.progress}%`)
      break
    case 'success':
      // state.url is available
      console.log(state.url)
      break
    case 'error':
      // state.message is available
      console.error(state.message)
      break
  }
}
```

---

## tsconfig.json Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",

    // Strict type checking
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,

    // Vue support
    "jsx": "preserve",
    "jsxImportSource": "vue",

    // Path mapping
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },

    // Other
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "exclude": ["node_modules"]
}
```

---

## Common TypeScript Errors & Solutions

### Error 1: Property does not exist
```typescript
// ❌ Error
const title = post.title  // Property 'title' does not exist on type 'never'

// ✅ Solution - Type the variable
const post = ref<Post | null>(null)
if (post.value) {
  const title = post.value.title  // Works!
}
```

### Error 2: Argument type mismatch
```typescript
// ❌ Error
emit('update', { id: 123 })  // Type 'number' is not assignable to type 'string'

// ✅ Solution - Match the type
emit('update', { id: '123' })
```

### Error 3: Possibly null/undefined
```typescript
// ❌ Error
console.log(user.display_name.toUpperCase())  // Object is possibly 'null'

// ✅ Solution - Null check
console.log(user.display_name?.toUpperCase() || 'ANONYMOUS')
```

---

## Best Practices

### ✅ Do:
- Use strict mode (`"strict": true`)
- Type all function parameters and return values
- Use interfaces for object shapes
- Use type guards for runtime checks
- Leverage TypeScript's inference
- Use `unknown` instead of `any` when type is truly unknown

### ❌ Don't:
- Use `any` (disables type checking)
- Use `as` assertions unless necessary
- Ignore TypeScript errors
- Create overly complex types
- Duplicate type definitions

---

## Type Definitions Location

```
src/
├── types/
│   ├── index.ts          # Main type exports
│   ├── database.ts       # Database entity types
│   ├── api.ts            # API request/response types
│   └── ui.ts             # UI component prop types
```

---

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript with Vue 3](https://vuejs.org/guide/typescript/overview.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Type Challenges](https://github.com/type-challenges/type-challenges)

---

## Impact on MuralMap

### Development Benefits
- ✅ Catch errors before runtime
- ✅ Better IDE autocomplete
- ✅ Self-documenting code
- ✅ Safer refactoring
- ✅ Improved team collaboration

### Code Quality
- All stores fully typed
- All components use typed props/emits
- All API calls typed with interfaces
- Strict null checks prevent crashes
- Type guards ensure runtime safety
