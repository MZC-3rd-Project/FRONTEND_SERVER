# React19 + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.


## 전체 폴더 구조
```shell
src/
├── assets/              # 정적 파일 (이미지, 폰트, 아이콘 등)
├── common/              # 공통 모듈
│   ├── api/            # API 클라이언트, 공통 API 함수
│   └── store/          # 전역 상태 관리 (Zustand)
├── components/          # 재사용 가능한 UI 컴포넌트 (Atomic Design)
│   ├── layout/         # 레이아웃 컴포넌트
│   ├── ui/             # Atoms, Molecules (shadcn UI 요소)
│   └── user/           # Organisms, Templates
├── css/                # 전역 스타일
├── domains/            # 기능별 도메인 (Feature-Based)
│   └── home/
│       ├── actions/    # 서버 액션, API 호출
│       ├── api/        # 도메인별 API
│       ├── hook/       # 커스텀 훅
│       └── page/       # 페이지 컴포넌트
├── lib/                # 유틸리티, 헬퍼 함수
└── routes/             # 라우팅 설정
    └── route.jsx

```

## ✅ zustand
### ❌ Redux Toolkit (최신 방식임에도 코드가 깁니다)
```JavaScript
// 1. Slice 생성
const counterSlice = createSlice({
name: 'counter',
initialState: { value: 0 },
reducers: {
increment: (state) => { state.value += 1 }
}
});

// 2. Store 등록 (보통 별도 파일)
const store = configureStore({ reducer: { counter: counterSlice.reducer } });

// 3. 사용하기
const count = useSelector(state => state.counter.value);
const dispatch = useDispatch();
<button onClick={() => dispatch(increment())}>+</button>
```
### ✅ Zustand (우리가 선택한 방식)
```JavaScript
// 1. Store 생성 (끝)
    const useStore = create((set) => ({
    count: 0,
    increase: () => set((state) => ({ count: state.count + 1 })),
    }));
    
    // 2. 사용하기 (Hooks와 동일)
    const { count, increase } = useStore();
    <button onClick={increase}>+</button>
```
✅ 참고 doc
```
https://zustand-demo.pmnd.rs/
```
## 🛰️ TanStack Query
프론트엔드에서 API를 통해 서버 데이터를 가져올 때, 단순히 데이터를 받는 것을 넘어 **"캐싱(저장), 업데이트, 에러 처리"**를 자동으로 해주는 아주 강력한 도구입니다.

### 1. 왜 사용하나요?
- 자동 업데이트: 데이터가 '상한(Stale)' 상태가 되면 알아서 새 데이터를 가져옵니다.

- 로딩 & 에러 처리: isLoading, isError 같은 상태 변수를 제공해 주어 코드가 깔끔해집니다.

- 캐싱: 한 번 가져온 데이터는 메모리에 저장해두어, 다시 방문했을 때 빛의 속도로 화면을 보여줍니다.

- 무한 스크롤 & 페이지네이션: 구현하기 까다로운 기능들을 쉽게 만들 수 있는 함수를 제공합니다.

#### ① useQuery: 데이터 읽기 (GET)
서버에서 데이터를 가져올 때 사용합니다.
```js
import { useQuery } from '@tanstack/react-query';

function UserProfile() {
  // 'users'라는 키로 데이터를 관리하고, fetch 함수를 실행합니다.
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'], 
    queryFn: () => fetch('/api/users').then(res => res.json())
  });

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생: {error.message}</div>;

  return <div>안녕하세요, {data.name}님!</div>;
}
```
#### ② useMutation: 데이터 변경 (POST, PUT, DELETE)
서버의 데이터를 수정하거나 추가할 때 사용합니다.
```js
import { useMutation, useQueryClient } from '@tanstack/react-query';

function AddUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newUser) => fetch('/api/users', { method: 'POST', body: JSON.stringify(newUser) }),
    onSuccess: () => {
      // 데이터를 추가한 후, 'users' 키를 가진 기존 데이터를 최신화(무효화)시킵니다.
      queryClient.invalidateQueries({ queryKey: ['users'] });
      alert('추가 성공!');
    }
  });

  return <button onClick={() => mutation.mutate({ name: '신규 유저' })}>유저 추가</button>;

}
```
## 🚫 useQuery와 함께라면 useEffect는 필요 없습니다
많은 개발자가 API 데이터를 가져올 때 useEffect를 사용하지만, 이는 안티 패턴인 경우가 많습니다.

### 1. 데이터를 다시 State에 담지 마세요 (가장 흔한 실수)
   useQuery가 반환하는 data를 또 다른 useState에 복사해서 넣지 마세요. 데이터가 두 곳에서 관리되면 동기화 문제가 발생합니다.

❌ 나쁜 예 (Effect 남용):

```JavaScript
const { data } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
const [list, setList] = useState([]);

useEffect(() => {
if (data) setList(data.filter(u => u.active)); // 렌더링 후 또 렌더링 발생!
}, [data]);
```
✅ 좋은 예 (렌더링 중 계산):

```JavaScript
const { data } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });

// 데이터를 받자마자 변수로 처리하거나 useMemo를 쓰세요.
const activeUsers = data?.filter(u => u.active) ?? [];
```
### 2. API 호출을 위해 Effect를 쓰지 마세요
조건에 따라 API를 다시 불러와야 할 때(예: 검색어 변경), useEffect 안에서 refetch를 누르는 대신 Query Key를 활용하세요.

❌ 나쁜 예: useEffect(() => { refetch() }, [search])

✅ 좋은 예: 
```javascript 
// search가 바뀌면 TanStack Query가 알아서 새 데이터를 가져옵니다. 
const { data } = useQuery({ queryKey: ['users', search], queryFn: () => fetchUsers(search) });
```

### 3. 데이터 로딩 완료 후 '알림' 처리는 핸들러에서 하세요
데이터를 성공적으로 가져왔을 때 특정 로직(예: 토스트 알림)을 실행하고 싶다면, useEffect로 data를 감시하지 말고 useQuery의 옵션이나 이벤트를 활용하세요.


✅ 참고 doc
```
https://tanstack.com/query/latest
```

- Query Key의 중요성: ['users', userId] 처럼 배열 안에 키를 넣습니다. 이 키가 다르면 서로 다른 데이터로 인식합니다.

-  서버에서 받아오는 모든 데이터는 TanStack Query로 관리하고, 그 외의 서비스 UI 상태는 Zustand로 관리하는 것이 베스트 프랙티스

## 🛡️ Zod: 데이터 안전 검사기 (Schema Validation)
Zod는 우리가 다루는 데이터(객체, 문자열, 숫자 등)가 우리가 원하는 규격에 맞는지 검사하고, TypeScript를 쓸 경우 타입 정의까지 자동으로 도와주는 도구입니다.

### 1. 왜 사용하나요?
- 런타임 에러 방지: 백엔드에서 이상한 데이터가 내려오거나, 사용자가 잘못된 값을 입력했을 때 즉시 잡아낼 수 있습니다.

- 자동 타입 생성: 스키마를 한 번 만들면 TypeScript 타입을 따로 정의할 필요가 없습니다.

- 직관적인 유효성 검사: "이메일 형식이어야 함", "최소 8글자" 같은 조건을 아주 읽기 쉬운 코드로 작성할 수 있습니다.

### 🛠️ useActionState + Zod: 폼 데이터 처리의 정석
React 19에서 도입된 useActionState는 폼(Form) 제출 상태(로딩, 결과, 에러)를 아주 쉽게 관리하게 해줍니다. 여기에 Zod를 더하면 데이터 검증까지 완벽해집니다.

📌 흐름 이해하기
1) Zod 스키마: 데이터가 어떤 형식이어야 하는지 정의합니다.
2) Action 함수: 데이터를 서버로 보내기 전, Zod로 검사(Validation)합니다.
3) useActionState: 검사 결과나 서버 응답을 화면에 실시간으로 반영합니다.

📌예제 코드: 회원가입 폼<br/>
Step 1: Zod 스키마 정의 (action.js)
```js
import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email("유효한 이메일을 입력해주세요."),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다."),
});
```

Step 2: 컴포넌트 구현<br/>
useActionState는 폼의 이전 상태와 서버 액션을 연결합니다.
```js
import { useActionState } from 'react';
import { signUpSchema } from './schema';

// 폼 처리를 담당하는 함수 (Server Action 역할)
async function signupAction(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  // 1. Zod 검증
  const validatedFields = signUpSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors, // 상세 에러 메시지 반환
    };
  }

  // 2. 서버 전송 로직 (예시)
  // await api.signup(validatedFields.data);

  return { success: true, message: "가입 성공!" };
}

function SignUpForm() {
  // state: 액션의 결과값, formAction: form에 연결할 함수, isPending: 로딩 상태
  const [state, formAction, isPending] = useActionState(signupAction, {
    success: false,
    errors: {},
  });

  return (
    <form action={formAction}>
      <input name="email" placeholder="이메일" />
      {/* 이메일 에러 표시 */}
      {state.errors?.email && <p style={{ color: 'red' }}>{state.errors.email[0]}</p>}

      <input name="password" type="password" placeholder="비밀번호" />
      {/* 비밀번호 에러 표시 */}
      {state.errors?.password && <p style={{ color: 'red' }}>{state.errors.password[0]}</p>}

      <button type="submit" disabled={isPending}>
        {isPending ? "전송 중..." : "가입하기"}
      </button>

      {state.success && <p>✅ {state.message}</p>}
    </form>
  );
}
```
✅ 참고 docs
```
https://www.heropy.dev/p/mJAAl7
```

## 🎨 Tailwind CSS & shadcn/ui: 쉽고 빠른 디자인 시스템
우리 프로젝트는 일일이 CSS 파일을 만들지 않습니다. Tailwind CSS로 스타일을 입히고, shadcn/ui로 검증된 컴포넌트를 가져와 사용합니다.

### 1. Tailwind CSS (스타일링 도구)
HTML 태그 안에 클래스 이름만 써서 바로 스타일을 입히는 방식입니다. (Utility-first)

- 왜 사용하나요? * CSS 파일을 왔다 갔다 할 필요가 없어 개발 속도가 엄청나게 빠릅니다.

  - 클래스 이름(flex, pt-4, text-blue-500)이 직관적입니다.

```js
<button class="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600">
  클릭하세요
</button>
```

### 2. shadcn/ui (컴포넌트 라이브러리)
shadcn은 일반적인 라이브러리와 다릅니다. 설치하는 게 아니라, 필요한 컴포넌트의 코드 자체를 우리 프로젝트로 가져오는(Copy & Paste) 방식입니다.
- 왜 사용하나요?

  - 자유로운 커스텀: 코드가 내 프로젝트 안에 있으므로 마음대로 수정할 수 있습니다.

  - 접근성: 장애가 있는 분들도 사용하기 편하도록 복잡한 웹 표준이 다 적용되어 있습니다.

  - 디자인: Tailwind 기반이라 깔끔하고 모던합니다.

### 3. 사용 방법 (Workflow)
 ####  Step 1: 필요한 컴포넌트 추가하기
터미널에서 원하는 컴포넌트를 명령어로 추가합니다. (예: 버튼, 입력창)<br/>
사이트에 들어가서 원하는 컴포넌트 검색해서 가져오기
```https://ui.shadcn.com/ ```

```shell
npx shadcn@latest add button input
```
#### Step 2: 가져와서 사용하기
이미 만들어진 부품을 조립하듯이 사용하면 됩니다.
```jsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginForm() {
  return (
    <div className="p-10 space-y-4"> {/* Tailwind 클래스 사용 */}
      <h1 className="text-2xl font-bold">로그인</h1>
      
      <Input placeholder="이메일을 입력하세요" />
      
      {/* shadcn 버튼에 Tailwind로 추가 스타일 적용 가능 */}
      <Button variant="outline" className="w-full">
        로그인 하기
      </Button>
    </div>
  )
}

```
#### 4. 핵심 시너지 (Tailwind + shadcn)
- Variant 기능: shadcn 컴포넌트는 variant="destructive" (빨간색), variant="ghost" (배경 없음) 같은 속성을 지원합니다.

- 일관성: 팀원 모두가 같은 디자인 가이드를 따르면서도, 세부 스타일은 Tailwind로 즉시 수정할 수 있습니다.