---
title: '블로그에 오신 것을 환영합니다'
date: 2025-01-28
tags: ['Welcome', 'Blog', 'Markdown']
category: 'General'
description: '새로운 정적 블로그의 첫 번째 게시글입니다. 마크다운 문법과 코드 하이라이팅을 테스트합니다.'
---

# 안녕하세요! 👋

이 블로그는 **GitHub Pages**와 **Vanilla JavaScript**로 구축된 정적 블로그입니다.

## 주요 기능

- 🌙 **다크/라이트 모드** - 우측 상단 버튼으로 전환
- 🔍 **검색 기능** - 제목, 태그, 내용으로 검색
- 🏷️ **태그 필터링** - 태그 클릭으로 필터링
- 💬 **Giscus 댓글** - GitHub Discussions 기반
- 📱 **반응형 디자인** - 모바일 최적화

## 마크다운 문법 예시

### 텍스트 스타일링

일반 텍스트, **굵은 텍스트**, *이탤릭*, ~~취소선~~, `인라인 코드`

### 인용구

> 좋은 코드는 그 자체로 최고의 문서다.
> — Steve McConnell

### 순서 없는 목록

- 첫 번째 항목
- 두 번째 항목
  - 중첩된 항목
  - 또 다른 중첩
- 세 번째 항목

### 순서 있는 목록

1. 첫 번째 단계
2. 두 번째 단계
3. 세 번째 단계

---

## 코드 하이라이팅

### JavaScript

```javascript
// 비동기 데이터 페칭 예시
async function fetchPosts() {
  try {
    const response = await fetch('/api/posts');
    const data = await response.json();
    
    return data.map(post => ({
      ...post,
      formattedDate: new Date(post.date).toLocaleDateString('ko-KR')
    }));
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}
```

### Python

```python
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class BlogPost:
    title: str
    content: str
    tags: List[str]
    published: bool = False
    
    def publish(self) -> None:
        self.published = True
        print(f"Published: {self.title}")

# 사용 예시
post = BlogPost(
    title="Hello World",
    content="Welcome to my blog!",
    tags=["python", "tutorial"]
)
post.publish()
```

### TypeScript

```typescript
interface Post {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
}

type PostStatus = 'draft' | 'published' | 'archived';

function filterPostsByTag(posts: Post[], tag: string): Post[] {
  return posts.filter(post => post.tags.includes(tag));
}
```

### CSS

```css
:root {
  --primary-color: #58a6ff;
  --bg-color: #0d1117;
  --text-color: #e6edf3;
}

.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem;
}

@media (max-width: 640px) {
  .container {
    padding: 1rem;
  }
}
```

### Bash

```bash
#!/bin/bash

# Git 초기화 및 첫 커밋
git init
git add .
git commit -m "Initial commit"

# GitHub Pages 배포
git remote add origin git@github.com:username/username.github.io.git
git push -u origin main

echo "배포 완료! 🚀"
```

---

## 표 (Table)

| 기능 | 설명 | 상태 |
|------|------|------|
| 다크 모드 | 테마 전환 | ✅ 완료 |
| 검색 | 클라이언트 사이드 검색 | ✅ 완료 |
| 댓글 | Giscus 연동 | ⏳ 설정 필요 |
| RSS | 피드 생성 | 📋 예정 |

---

## 링크

- [GitHub](https://github.com/hyuniciel)
- [블로그 홈](/)

---

## 마무리

이 블로그는 간단하지만 강력합니다. 마크다운으로 글을 작성하고, `git push`만 하면 자동으로 배포됩니다.

새로운 게시글을 작성하려면:

1. `pages/` 폴더에 `.md` 파일 생성
2. Front Matter에 메타데이터 작성
3. 마크다운으로 내용 작성
4. Git 커밋 & 푸시

Happy blogging! 🎉

