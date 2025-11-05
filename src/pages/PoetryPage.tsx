// ===== IMPORTS =====
// Styled Components - CSS-in-JS 스타일링
import styled from 'styled-components'
// 데이터 import - 시 페이지용 이미지와 텍스트 데이터
import { poetryImages, poetryTexts } from '../data/content'

// ===== STYLED COMPONENTS =====
// 페이지 전체 섹션
const Section = styled.section`
  padding: 2rem 0;  // 상하 패딩
`

// 페이지 제목 - 그라데이션 텍스트 효과
const PageTitle = styled.h2`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
  // 그라데이션 텍스트 효과
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

// 콘텐츠 그리드 - 섹션들 간의 간격
const ContentGrid = styled.div`
  display: grid;
  gap: 3rem;  // 섹션 간 간격
  
  // 모바일 반응형 - 간격 조정
  @media (max-width: 768px) {
    gap: 2rem;
  }
`

// 섹션 컨테이너 - 카드 스타일
const SectionContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 15px;  // 둥근 모서리
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);  // 그림자 효과
  border: 1px solid #f0f0f0;  // 연한 테두리
`

// 섹션 제목 - 하단에 장식선 추가
const SectionTitle = styled.h3`
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
  position: relative;
  
  // 하단 장식선 (::after 가상 요소)
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);  // 중앙 정렬
    width: 50px;
    height: 3px;
    background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
    border-radius: 2px;
  }
`

// 그리드 레이아웃 - 반응형 카드 배치
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));  // 최소 300px, 자동 맞춤
  gap: 1.5rem;
  
  // 모바일 반응형 - 세로 배치
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

// 기본 카드 스타일 - 호버 효과 포함
const Card = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;  // 부드러운 애니메이션
  border: 1px solid #e9ecef;
  
  // 호버 효과 - 위로 이동, 그림자, 테두리 색상 변경
  &:hover {
    transform: translateY(-5px);  // 위로 5px 이동
    box-shadow: 0 15px 35px rgba(0,0,0,0.1);  // 그림자 강화
    border-color: #667eea;  // 테두리 색상 변경
  }
`

// 이미지 카드 - 중앙 정렬
const ImageCard = styled(Card)`
  text-align: center;
`

// 이미지 스타일 - 호버 시 확대 효과
const Image = styled.img`
  width: 100%;
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.02);  // 2% 확대
  }
`

// 이미지 캡션 (현재 사용되지 않음)
const ImageCaption = styled.figcaption`
  font-weight: 600;
  color: #495057;
  font-size: 1.1rem;
`

// 텍스트 카드 - 왼쪽 정렬
const TextCard = styled(Card)`
  text-align: left;
`

// 텍스트 제목
const TextTitle = styled.h4`
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
`

// 텍스트 내용 - 줄바꿈 보존
const TextContent = styled.p`
  color: #495057;
  line-height: 1.8;  // 줄 간격
  font-size: 1rem;
  margin: 0;
  white-space: pre-wrap;  // 줄바꿈과 공백 보존
`

// ===== MAIN COMPONENT =====
// 시 페이지 메인 컴포넌트 - 이미지와 시를 표시
export default function PoetryPage() {
  return (
    <Section>
      {/* 콘텐츠 그리드 - 이미지와 시 섹션 */}
      <ContentGrid>
        {/* 이미지 섹션 */}
        <SectionContainer>
          <SectionTitle>이미지</SectionTitle>
          <Grid>
            {/* 이미지 목록 렌더링 - map으로 반복 */}
            {poetryImages.map((img) => (
              <ImageCard key={img.id}>
                <Image src={img.src} alt={img.title} />
              </ImageCard>
            ))}
          </Grid>
        </SectionContainer>
        
        {/* 시 섹션 - 제목 없이 바로 시 내용 표시 */}
        <SectionContainer>
          <Grid>
            {/* 시 목록 렌더링 - 제목과 내용 표시 */}
            {poetryTexts.map((text) => (
              <TextCard key={text.id}>
                <TextTitle>{text.title}</TextTitle>
                <TextContent>{text.content}</TextContent>
              </TextCard>
            ))}
          </Grid>
        </SectionContainer>
      </ContentGrid>
    </Section>
  )
}