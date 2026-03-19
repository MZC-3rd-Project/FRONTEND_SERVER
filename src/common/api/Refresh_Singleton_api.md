  ---                                                                                             
구현 결과

파일 구성

src/common/                                                                                     
├── api/                                                                                          
│   ├── tokenManager.js      ← 새로 생성                                                        
│   ├── createAuthClient.js  ← 새로 생성                                                          
│   └── apiInstacne.js       ← 수정                                                               
└── store/                                                                                        
└── useAuthStore.js      ← 새로 생성
                                                                                                    
---                                                                                               
동작 흐름 (401 발생 시)

컴포넌트 A ──┐                                                                                  
컴포넌트 B ──┼──→ 모두 401 수신                                                                   
컴포넌트 C ──┘

          ↓ createAuthClient interceptor (각각)                                                     

req._retry 체크 → 최초 요청만 통과

          ↓                                                                                         

tokenManager.refresh() 호출                                                                       
↳ refreshPromise가 이미 있으면 → 같은 Promise 반환 (요청 1번만 전송)                          
↳ refreshPromise가 없으면 → POST /auth/refresh 실행

          ↓ 완료                                                                                    

A, B, C 모두 원래 요청 재시도
                                                                                                  
---                                                                                               
CLAUDE.md 패턴 대비 변경점

┌───────────────────┬──────────────────────────────┬─────────────────────────┐                  
│       항목        │       CLAUDE.md (JWT)        │    현재 구현 (쿠키)     │                    
├───────────────────┼──────────────────────────────┼─────────────────────────┤                    
│ 토큰 저장         │ localStorage                 │ 없음 (브라우저 쿠키)    │                    
├───────────────────┼──────────────────────────────┼─────────────────────────┤                    
│ 요청 interceptor  │ Authorization 헤더 주입      │ 없음 (쿠키 자동 전송)   │                    
├───────────────────┼──────────────────────────────┼─────────────────────────┤                    
│ refreshFn 인자    │ refreshToken 문자열          │ 없음 (쿠키로 자동 처리) │                    
├───────────────────┼──────────────────────────────┼─────────────────────────┤                    
│ useAuthStore 상태 │ accessToken, isAuthenticated │ isAuthenticated, user   │                  
└───────────────────┴──────────────────────────────┴─────────────────────────┘
                                                                                                  
---                                                                                               
refresh URL 확인 필요

현재 /auth/refresh로 설정되어 있습니다. 백엔드 실제 엔드포인트가 다르면 apiInstacne.js 83~88라인의
URL을 수정해주세요. 