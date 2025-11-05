// ===== IMPORTS =====
// Styled Components - CSS-in-JS 스타일링
import styled from 'styled-components'
// React Hooks - 상태 관리와 DOM 참조
import { useState, useRef } from 'react'
// 데이터 import - 이미지와 오디오 데이터
import { dotlineImages, dotlineAudio } from '../data/content'

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
    border-color: #ff6b9d;  // 테두리 색상 변경
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

// 오디오 카드 - 중앙 정렬
const AudioCard = styled(Card)`
  text-align: center;
`

// ===== CUSTOM AUDIO PLAYER STYLED COMPONENTS =====
// 커스텀 오디오 플레이어 컨테이너 - 그라데이션 배경
const CustomAudioPlayer = styled.div`
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3);
  border: 2px solid #ff6b9d;
`

// 오디오 컨트롤 영역 - 플레이 버튼과 정보를 가로로 배치
const AudioControls = styled.div`
  display: flex;
  align-items: center;  // 세로 중앙 정렬
  gap: 1rem;           // 요소 간 간격
  margin-bottom: 1rem;
`

// 플레이/정지 버튼 - 원형 버튼에 호버 효과
const PlayButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 50%;  // 원형 버튼
  border: none;
  background: white;
  color: #ff6b9d;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  
  // 호버 효과 - 확대와 그림자 강화
  &:hover {
    transform: scale(1.1);  // 10% 확대
    box-shadow: 0 6px 16px rgba(0,0,0,0.3);
  }
  
  // 클릭 효과 - 축소
  &:active {
    transform: scale(0.95);  // 5% 축소
  }
`

// 오디오 정보 영역 - 제목과 시간 표시
const AudioInfo = styled.div`
  flex: 1;  // 남은 공간 모두 차지
  color: white;
`

// 오디오 제목
const AudioTitle = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`

// 시간 표시 (현재 시간 / 전체 시간)
const TimeDisplay = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;  // 약간 투명하게
`

// 진행률 바 컨테이너 - 클릭 가능
const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255,255,255,0.3);  // 반투명 흰색
  border-radius: 3px;
  overflow: hidden;
  cursor: pointer;  // 클릭 가능 표시
`

// 진행률 표시 바 - props로 진행률 받음
const Progress = styled.div<{ progress: number }>`
  height: 100%;
  background: white;
  border-radius: 3px;
  transition: width 0.1s ease;  // 부드러운 애니메이션
  width: ${props => props.progress}%;  // props로 받은 진행률만큼 너비 설정
`

// 숨겨진 오디오 요소 - 실제 재생 담당
const HiddenAudio = styled.audio`
  display: none;  // 화면에 보이지 않음
`

// ===== TYPES =====
// 오디오 아이템 타입 정의
interface AudioItem {
  id: string;
  title: string;
  src: string;
}

// ===== CUSTOM AUDIO PLAYER COMPONENT =====
// 커스텀 오디오 플레이어 컴포넌트 - 재생/정지, 진행률, 시간 표시 기능
function AudioPlayerComponent({ audio }: { audio: AudioItem }) {
  // ===== STATE HOOKS =====
  const [isPlaying, setIsPlaying] = useState(false)  // 재생 상태
  const [currentTime, setCurrentTime] = useState(0)   // 현재 재생 시간
  const [duration, setDuration] = useState(0)         // 전체 재생 시간
  const audioRef = useRef<HTMLAudioElement>(null)    // 오디오 DOM 참조

  // ===== EVENT HANDLERS =====
  // 플레이/정지 토글 함수
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()  // 정지
      } else {
        audioRef.current.play()  // 재생
      }
      setIsPlaying(!isPlaying)  // 상태 반전
    }
  }

  // 시간 업데이트 핸들러 - 재생 중 계속 호출됨
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  // 메타데이터 로드 핸들러 - 오디오 파일 정보가 로드되면 호출
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  // 진행률 바 클릭 핸들러 - 클릭한 위치로 재생 시간 이동
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect()  // 클릭한 요소의 위치 정보
      const clickX = e.clientX - rect.left                  // 클릭한 X 좌표 (요소 기준)
      const width = rect.width                              // 진행률 바 전체 너비
      const newTime = (clickX / width) * duration           // 클릭 비율에 따른 새로운 시간
      audioRef.current.currentTime = newTime                // 오디오 시간 설정
      setCurrentTime(newTime)                              // 상태 업데이트
    }
  }

  // ===== UTILITY FUNCTIONS =====
  // 시간 포맷팅 함수 (초를 mm:ss 형식으로 변환)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)  // 분 계산
    const seconds = Math.floor(time % 60)  // 초 계산
    return `${minutes}:${seconds.toString().padStart(2, '0')}`  // 두 자리 초 형식
  }

  // 진행률 계산 (0-100%)
  const progress = duration ? (currentTime / duration) * 100 : 0

  // 주석은 나와 협업자를 위한 메모입니다.
  // ===== RENDER ===== 
  return (
    <CustomAudioPlayer>
      {/* 숨겨진 실제 오디오 요소 - 모든 이벤트 처리 */}
      {/* 아무말이나 써도 코드에 영향을 주지 않습니다. 
      가끔은 주석을 이용해 편지를 쓰는 낭만적인 개발자도 있습니다.*/}
      <HiddenAudio
        ref={audioRef}
        src={audio.src}
        onTimeUpdate={handleTimeUpdate}        // 시간 업데이트 이벤트
        onLoadedMetadata={handleLoadedMetadata} // 메타데이터 로드 이벤트
        onEnded={() => setIsPlaying(false)}     // 재생 완료 이벤트
      />
      
      {/* 컨트롤 영역 */}
      <AudioControls>
        {/* 플레이/정지 버튼 - 상태에 따라 아이콘 변경 */}
        <PlayButton onClick={togglePlay}>
          {isPlaying ? '⏸️' : '▶️'}
        </PlayButton>
        
        {/* 오디오 정보 */}
        <AudioInfo>
          <AudioTitle>{audio.title}</AudioTitle>
          <TimeDisplay>
            {formatTime(currentTime)} / {formatTime(duration)}
          </TimeDisplay>
        </AudioInfo>
      </AudioControls>
      
      {/* 진행률 바 - 클릭으로 구간 이동 가능 */}
      <ProgressBar onClick={handleProgressClick}>
        <Progress progress={progress} />
      </ProgressBar>
    </CustomAudioPlayer>
  )
}

// ===== MAIN COMPONENT =====
// 인생그래프 페이지 메인 컴포넌트 - 이미지와 오디오를 표시
export default function DotlinePage() {
  return (
    <Section>
      {/* 페이지 제목 */}
      <PageTitle>인생그래프</PageTitle>
      
      {/* 콘텐츠 그리드 - 이미지와 오디오 섹션 */}
      <ContentGrid>
        {/* 이미지 섹션 */}
        <SectionContainer>
          <Grid>
            {/* 이미지 목록 렌더링 - map으로 반복 */}
            {dotlineImages.map((img, index) => (
              <ImageCard key={index}>
                <Image src={img.src} alt={img.title} />
              </ImageCard>
            ))}
          </Grid>
        </SectionContainer>
        
        {/* 오디오 섹션 */}
        <SectionContainer>
          <SectionTitle>인생그래프로 만든 우연성 음악</SectionTitle>
          <Grid>
            {/* 오디오 목록 렌더링 - 커스텀 플레이어 사용 */}
            {dotlineAudio.map((audio) => (
              <AudioCard key={audio.id}>
                <AudioPlayerComponent audio={audio} />
              </AudioCard>
            ))}
          </Grid>
        </SectionContainer>
      </ContentGrid>
    </Section>
  )
}