// ===== IMPORTS =====
import { useState, useRef, useEffect } from 'react'
import { dotlineAudio } from '../data/content'
import styled from 'styled-components'

// ===== STYLED COMPONENTS =====
// 전체 컨테이너 - 화면 전체를 차지하고 중앙 정렬
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`

// 재생/일시정지 버튼 - 큰 원형 버튼
const PlayPauseButton = styled.button`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: none;
  background: white;
  color: #667eea;
  font-size: 3rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
    font-size: 2.5rem;
  }
`

// 숨겨진 오디오 요소
const HiddenAudio = styled.audio`
  display: none;
`

// ===== MAIN COMPONENT =====
export default function DotlinePage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const volumeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const oneMinuteTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isInOneMinuteCycleRef = useRef(false)

  // ===== 수동 재생/일시정지 토글 =====
  const togglePlay = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
        // 수동 일시정지 시 모든 타이머 정리
        if (volumeIntervalRef.current) {
          clearInterval(volumeIntervalRef.current)
          volumeIntervalRef.current = null
        }
        if (oneMinuteTimerRef.current) {
          clearTimeout(oneMinuteTimerRef.current)
          oneMinuteTimerRef.current = null
        }
        isInOneMinuteCycleRef.current = false
        audioRef.current.volume = 1
        console.log('🎵 [수동] 음악 일시정지')
      } else {
        try {
          await audioRef.current.play()
          setIsPlaying(true)
          console.log('🎵 [수동] 음악 재생 시작')
        } catch (error) {
          console.error('재생 실패:', error)
        }
      }
    }
  }

  // ===== 볼륨 페이드 인/아웃 함수 =====
  // 10초 동안 볼륨을 0에서 1로 또는 1에서 0으로 변경
  const fadeVolume = (targetVolume: number, duration: number) => {
    if (!audioRef.current) return

    const startVolume = audioRef.current.volume
    const startTime = Date.now()
    const volumeChange = targetVolume - startVolume

    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current)
    }

    volumeIntervalRef.current = setInterval(() => {
      if (!audioRef.current) return

      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const currentVolume = startVolume + volumeChange * progress

      audioRef.current.volume = currentVolume

      if (progress >= 1) {
        if (volumeIntervalRef.current) {
          clearInterval(volumeIntervalRef.current)
          volumeIntervalRef.current = null
        }
      }
    }, 50) // 50ms마다 볼륨 업데이트
  }

  // ===== 1분 사이클 시작 함수 =====
  // 10초 페이드 인 → 10초 페이드 아웃을 3번 반복 (총 60초)
  const startOneMinuteCycle = async () => {
    if (!audioRef.current || isInOneMinuteCycleRef.current) return

    isInOneMinuteCycleRef.current = true
    console.log('🎵 [1분 사이클] 시작 - 페이드 인/아웃 3번 반복')

    try {
      // 재생 시작
      if (audioRef.current.paused) {
        await audioRef.current.play()
        setIsPlaying(true)
      }

      // 볼륨 초기화
      audioRef.current.volume = 0

      // 3번 반복: 페이드 인(10초) → 페이드 아웃(10초)
      for (let i = 0; i < 3; i++) {
        console.log(`🎵 [1분 사이클] ${i + 1}번째 반복 시작`)
        
        // 페이드 인 (0 → 1, 10초)
        fadeVolume(1, 10000)
        await new Promise(resolve => setTimeout(resolve, 10000))

        // 페이드 아웃 (1 → 0, 10초)
        fadeVolume(0, 10000)
        await new Promise(resolve => setTimeout(resolve, 10000))
      }

      console.log('🎵 [1분 사이클] 완료 - DB 재확인')

      // 1분 후 DB 재확인
      oneMinuteTimerRef.current = setTimeout(async () => {
        isInOneMinuteCycleRef.current = false
        if (volumeIntervalRef.current) {
          clearInterval(volumeIntervalRef.current)
          volumeIntervalRef.current = null
        }

        // DB 재확인
        try {
          const response = await fetch(
            'https://yencctv-10945-default-rtdb.asia-southeast1.firebasedatabase.app/vibe_speaker.json'
          )
          const value = await response.json()

          if (value === true) {
            console.log('🎵 [DB 재확인] vibe_speaker=true → 1분 사이클 다시 시작')
            startOneMinuteCycle()
          } else {
            console.log('🎵 [DB 재확인] vibe_speaker=false → 음악 중지')
    if (audioRef.current) {
              audioRef.current.pause()
              setIsPlaying(false)
              audioRef.current.volume = 1
            }
          }
        } catch (error) {
          console.error('DB 재확인 중 오류:', error)
        }
      }, 0) // 즉시 실행 (이미 60초가 지났으므로)
    } catch (error) {
      console.error('1분 사이클 시작 실패:', error)
      isInOneMinuteCycleRef.current = false
    }
  }

  // ===== FIREBASE REALTIME DATABASE 연동 =====
  // vibe_speaker 값(true/false)에 따라 자동 재생/일시정지 제어
  useEffect(() => {
    let isMounted = true

    const fetchPlaybackState = async () => {
      try {
        const response = await fetch(
          'https://yencctv-10945-default-rtdb.asia-southeast1.firebasedatabase.app/vibe_speaker.json'
        )
        const value = await response.json()

        if (!isMounted || !audioRef.current) return

        if (value === true) {
          // true인 경우 - 1분 사이클이 진행 중이 아니면 시작
          if (!isInOneMinuteCycleRef.current) {
            startOneMinuteCycle()
          }
        } else {
          // false인 경우 - 1분 사이클이 진행 중이 아니면 중지
          // 1분 사이클이 진행 중이면 무시하고 오디오가 pause되어 있으면 재생
          if (!isInOneMinuteCycleRef.current) {
            if (!audioRef.current.paused) {
              audioRef.current.pause()
              setIsPlaying(false)
              audioRef.current.volume = 1
              console.log('🎵 [Firebase DB] vibe_speaker=false → 음악 일시정지')
            }
          } else {
            console.log('🎵 [Firebase DB] vibe_speaker=false 감지했지만 1분 사이클 진행 중이므로 무시')
            // 1분 사이클 진행 중인데 오디오가 pause되어 있으면 재생
            if (audioRef.current.paused) {
              try {
                await audioRef.current.play()
                console.log('🎵 [1분 사이클 보호] pause된 오디오를 재생으로 복구')
              } catch (error) {
                console.error('재생 복구 실패:', error)
              }
            }
          }
        }
      } catch (error) {
        console.error('재생 상태를 가져오는 중 오류 발생:', error)
      }
    }

    // 초기 한 번 실행 후, 주기적으로 상태 확인
    fetchPlaybackState()
    const intervalId = setInterval(fetchPlaybackState, 3000) // 3초마다 상태 확인

    return () => {
      isMounted = false
      clearInterval(intervalId)
      if (volumeIntervalRef.current) {
        clearInterval(volumeIntervalRef.current)
      }
      if (oneMinuteTimerRef.current) {
        clearTimeout(oneMinuteTimerRef.current)
      }
    }
  }, [])

  // 1분 사이클 진행 중 오디오 보호 - pause되면 자동으로 재생
  useEffect(() => {
    const protectAudio = setInterval(() => {
      if (isInOneMinuteCycleRef.current && audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play().catch((error) => {
            console.error('보호 재생 실패:', error)
          })
        }
      }
    }, 1000) // 1초마다 확인

    return () => {
      clearInterval(protectAudio)
    }
  }, [])

  // 오디오 재생 상태 동기화 - 실제 오디오 상태와 UI 상태를 일치시킴
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // 초기 상태 동기화
    setIsPlaying(!audio.paused)

    const handlePlay = () => {
      setIsPlaying(true)
      console.log('🎵 [오디오 이벤트] 재생 중')
    }

    const handlePause = async () => {
      // 1분 사이클 진행 중이면 일시정지 무시하고 다시 재생
      if (isInOneMinuteCycleRef.current) {
        console.log('🎵 [오디오 이벤트] 일시정지 감지했지만 1분 사이클 진행 중이므로 재생 유지')
        if (audio && audio.paused) {
          try {
            await audio.play()
          } catch (error) {
            console.error('재생 재개 실패:', error)
          }
        }
        return
      }
      
      setIsPlaying(false)
      console.log('🎵 [오디오 이벤트] 일시정지됨')
    }

    const handleEnded = () => {
      setIsPlaying(false)
      console.log('🎵 [오디오 이벤트] 재생 완료')
    }

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  // 첫 번째 오디오만 사용
  const audio = dotlineAudio[0]

  return (
    <Container>
      <PlayPauseButton onClick={togglePlay}>
        {isPlaying ? '⏸️' : '▶️'}
      </PlayPauseButton>
      <HiddenAudio
        ref={audioRef}
        src={audio.src}
        loop // 무한 반복
      />
    </Container>
  )
}
