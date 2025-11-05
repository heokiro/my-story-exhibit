// React Router DOM - 페이지 라우팅을 위한 라이브러리
import { Link, NavLink, Outlet, Route, Routes } from 'react-router-dom'
// Styled Components - CSS-in-JS 스타일링 라이브러리
import styled from 'styled-components'
// 각 페이지 컴포넌트들 import
import DotlinePage from './pages/DotlinePage'
import PoetryPage from './pages/PoetryPage'
import SongPage from './pages/SongPage'

// ===== STYLED COMPONENTS =====
// 전체 컨테이너 - 최대 너비와 중앙 정렬
const Container = styled.div`
  max-width: 1200px;  // 최대 너비 제한
  margin: 0 auto;      // 중앙 정렬
  padding: 0 20px;     // 좌우 패딩
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;   // 줄 간격
  color: #333;        // 기본 텍스트 색상
`

// 헤더 영역 - 그라데이션 배경과 그림자 효과
const Header = styled.header`
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%); // 대각선 그라데이션
  color: white;
  padding: 1rem 0;
  margin-bottom: 2rem;
  border-radius: 0 0 20px 20px;  // 하단 모서리만 둥글게
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);  // 그림자 효과
`

// 브랜드 로고 링크 - 호버 시 확대 효과
const Brand = styled(Link)`
  font-size: 1.8rem;
  font-weight: bold;
  text-decoration: none;
  color: white;
  display: block;
  text-align: center;
  margin-bottom: 1rem;
  transition: transform 0.3s ease;  // 부드러운 애니메이션
  
  &:hover {
    transform: scale(1.05);  // 호버 시 5% 확대
  }
`

// 네비게이션 메뉴 - 반응형 레이아웃
const Nav = styled.nav`
  display: flex;
  justify-content: center;  // 중앙 정렬
  gap: 2rem;                // 메뉴 간격
  
  // 모바일 반응형 - 세로 배치
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`

// 네비게이션 링크 - 활성 상태와 호버 효과
const NavLinkStyled = styled(NavLink)`
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 25px;      // 둥근 모서리
  transition: all 0.3s ease; // 모든 속성에 애니메이션
  font-weight: 500;
  
  &:hover {
    background: rgba(255,255,255,0.2);  // 반투명 흰색 배경
    transform: translateY(-2px);         // 위로 2px 이동
  }
  
  &.active {
    background: rgba(255,255,255,0.3);  // 활성 상태 배경
    box-shadow: 0 4px 15px rgba(0,0,0,0.2); // 그림자 효과
  }
`

// 메인 콘텐츠 영역
const Main = styled.main`
  min-height: 60vh;  // 최소 높이 설정
  padding: 2rem 0;   // 상하 패딩
`

// ===== LAYOUT COMPONENT =====
// 전체 레이아웃을 담당하는 컴포넌트
function Layout() {
  return (
    <Container>
      {/* 헤더 영역 - 브랜드와 네비게이션 */}
      <Header>
        {/* 브랜드 로고 - 홈으로 이동하는 링크 */}
        <Brand to="/">My Story Exhibit</Brand>
        {/* 네비게이션 메뉴 */}
        <Nav>
          <NavLinkStyled to="/dotline">인생그래프</NavLinkStyled>
          <NavLinkStyled to="/poetry">시</NavLinkStyled>
          <NavLinkStyled to="/song">노래</NavLinkStyled>
        </Nav>
      </Header>
      {/* 메인 콘텐츠 영역 - Outlet으로 하위 페이지 렌더링 */}
      <Main>
        <Outlet />
      </Main>
    </Container>
  )
}

// ===== HOME PAGE STYLED COMPONENTS =====
// 홈페이지 섹션 - 그라데이션 배경과 중앙 정렬
const HomeSection = styled.section`
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); // 연한 그라데이션
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);  // 부드러운 그림자
`

// 홈페이지 제목 - 그라데이션 텍스트 효과
const HomeTitle = styled.h1`
  font-size: 3rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  // 그라데이션 텍스트 효과 (웹킷 브라우저)
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  // 모바일 반응형 - 폰트 크기 조정
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`

// 홈페이지 설명 텍스트
const HomeDescription = styled.p`
  font-size: 1.2rem;
  color: #7f8c8d;
  max-width: 600px;  // 최대 너비 제한
  margin: 0 auto;    // 중앙 정렬
  line-height: 1.8; // 줄 간격
`

// ===== HOME PAGE COMPONENT =====
// 홈페이지 컴포넌트 - 웰컴 메시지 표시
function HomePage() {
  return (
    <HomeSection>
      <HomeTitle>인생그래프, 시, 노래</HomeTitle>
      <HomeDescription>인생그래프, 시, 노래로 구성된 나만의 이야기 전시</HomeDescription>
    </HomeSection>
  )
}

// ===== MAIN APP COMPONENT =====
// React Router를 사용한 라우팅 설정
function App() {
  return (
    <Routes>
      {/* Layout 컴포넌트를 부모 라우트로 설정 */}
      <Route element={<Layout />}>
        {/* 홈페이지 - index는 "/" 경로 */}
        <Route index element={<HomePage />} />
        {/* 각 페이지 라우트 설정 */}
        <Route path="dotline" element={<DotlinePage />} />
        <Route path="poetry" element={<PoetryPage />} />
        <Route path="song" element={<SongPage />} />
      </Route>
    </Routes>
  )
}

export default App
