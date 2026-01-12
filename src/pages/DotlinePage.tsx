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

// 오디오 상태 표시 컨테이너
const AudioStatusContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 30px;
  align-items: center;
`

// 오디오 상태 아이템
const AudioStatusItem = styled.div<{ isPlaying: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  
  ${props => props.isPlaying && `
    background: rgba(102, 126, 234, 0.2);
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  `}
`

// 재생 인디케이터
const PlayingIndicator = styled.div<{ isPlaying: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.isPlaying ? '#4CAF50' : '#ccc'};
  animation: ${props => props.isPlaying ? 'pulse 1.5s ease-in-out infinite' : 'none'};
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.2);
    }
  }
`

const AudioStatusText = styled.span`
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
`

// ===== MAIN COMPONENT =====
export default function DotlinePage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFactoryPlaying, setIsFactoryPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const factoryAudioRef = useRef<HTMLAudioElement>(null)
  const volumeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const factoryVolumeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const oneMinuteTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isInOneMinuteCycleRef = useRef(false)
  const factoryPlayTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isFactoryPlayingRef = useRef(false)
  const factoryPausedTimeRef = useRef<number>(0) // 멈춘 위치를 기억하는 ref

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

  // ===== Factory 오디오 페이드 인/아웃 함수 =====
  const fadeFactoryVolume = (targetVolume: number, duration: number) => {
    if (!factoryAudioRef.current) return

    const startVolume = factoryAudioRef.current.volume
    const startTime = Date.now()
    const volumeChange = targetVolume - startVolume

    if (factoryVolumeIntervalRef.current) {
      clearInterval(factoryVolumeIntervalRef.current)
    }

    factoryVolumeIntervalRef.current = setInterval(() => {
      if (!factoryAudioRef.current) return

      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const currentVolume = startVolume + volumeChange * progress

      factoryAudioRef.current.volume = currentVolume

      if (progress >= 1) {
        if (factoryVolumeIntervalRef.current) {
          clearInterval(factoryVolumeIntervalRef.current)
          factoryVolumeIntervalRef.current = null
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

  // ===== FIREBASE REALTIME DATABASE 연동 - Factory 오디오 =====
  // motor_1 또는 motor_2 값(true)에 따라 factory.mp3 재생 (실시간 리스너 사용)
  useEffect(() => {
    let isMounted = true
    console.log('🏭 [useEffect] Factory 오디오 useEffect 시작')

    // Firebase SDK 로드 대기 (더 긴 대기 시간과 다양한 접근 방법 시도)
    const waitForFirebase = (): Promise<any> => {
      return new Promise((resolve) => {
        // 여러 방법으로 Firebase 접근 시도
        const getFirebase = () => {
          return (window as any).firebase || 
                 (window as any).firebase?.app ||
                 (globalThis as any).firebase
        }

        const firebase = getFirebase()
        if (firebase && firebase.database) {
          console.log('🏭 [Firebase] Firebase SDK가 이미 로드되어 있습니다')
          resolve(firebase)
          return
        }

        console.log('🏭 [Firebase] Firebase SDK 로드 대기 중...')
        console.log('🏭 [Firebase] window.firebase:', (window as any).firebase)
        console.log('🏭 [Firebase] window:', Object.keys(window).filter(k => k.includes('firebase')))
        
        let attempts = 0
        const maxAttempts = 100 // 10초 대기 (더 길게)

        const checkFirebase = setInterval(() => {
          attempts++
          const firebase = getFirebase()
          if (firebase && firebase.database) {
            console.log('🏭 [Firebase] Firebase SDK 로드 완료! (시도 횟수:', attempts, ')')
            clearInterval(checkFirebase)
            resolve(firebase)
          } else if (attempts >= maxAttempts) {
            console.error('🏭 [Firebase] Firebase SDK 로드 타임아웃 - fetch 방식으로 전환')
            clearInterval(checkFirebase)
            // Firebase SDK가 없으면 fetch 방식으로 폴백
            resolve(null)
          }
        }, 100)
      })
    }

    let motor1Ref: any = null
    let motor2Ref: any = null
    let fetchIntervalId: NodeJS.Timeout | null = null
    let motorTrueTimerRef: NodeJS.Timeout | null = null // true 값 유지 확인용 타이머
    let motorTrueStartTime: number | null = null // true가 시작된 시간
    let lastMotor1Value: boolean = false
    let lastMotor2Value: boolean = false
    
    // Motor 상태를 확인하는 함수
    const checkMotorState = async (): Promise<boolean> => {
      try {
        const [motor1Response, motor2Response] = await Promise.all([
          fetch('https://yencctv-10945-default-rtdb.asia-southeast1.firebasedatabase.app/motor_1.json'),
          fetch('https://yencctv-10945-default-rtdb.asia-southeast1.firebasedatabase.app/motor_2.json')
        ])
        const motor1Value = await motor1Response.json() === true
        const motor2Value = await motor2Response.json() === true
        return motor1Value === true || motor2Value === true
      } catch (error) {
        console.error('🏭 [checkMotorState] 오류:', error)
        // 오류 발생 시 마지막으로 알려진 값 사용
        return lastMotor1Value === true || lastMotor2Value === true
      }
    }

    // Factory 오디오 재생 함수 (useEffect 내부에 정의하여 최신 ref 접근 보장)
    const playFactoryAudioInternal = async () => {
      console.log('🏭 [playFactoryAudioInternal] 함수 호출됨')
      console.log('🏭 [playFactoryAudioInternal] factoryAudioRef.current:', factoryAudioRef.current)
      console.log('🏭 [playFactoryAudioInternal] isFactoryPlayingRef.current:', isFactoryPlayingRef.current)

      if (!factoryAudioRef.current) {
        console.error('🏭 [playFactoryAudioInternal] factoryAudioRef.current가 null입니다')
        return
      }

      if (isFactoryPlayingRef.current) {
        console.log('🏭 [playFactoryAudioInternal] 이미 재생 중이므로 스킵')
        return
      }

      // 오디오가 로드되었는지 확인
      if (factoryAudioRef.current.readyState < 2) {
        console.log('🏭 [playFactoryAudioInternal] 오디오가 아직 로드되지 않음, 로드 대기 중...')
        factoryAudioRef.current.addEventListener('canplay', async () => {
          if (!isMounted || isFactoryPlayingRef.current) return
          await playFactoryAudioInternal()
        }, { once: true })
        return
      }

      isFactoryPlayingRef.current = true
      console.log('🏭 [playFactoryAudioInternal] 재생 시작 플래그 설정됨')

      try {
        // 멈춘 위치가 저장되어 있으면 그 위치부터 재생 시작
        if (factoryPausedTimeRef.current > 0) {
          factoryAudioRef.current.currentTime = factoryPausedTimeRef.current
          console.log('🏭 [playFactoryAudioInternal] 저장된 위치부터 재생:', factoryPausedTimeRef.current, '초')
        }

        // 재생 시작
        if (factoryAudioRef.current.paused) {
          console.log('🏭 [playFactoryAudioInternal] 오디오 재생 시도 중... (현재 위치:', factoryAudioRef.current.currentTime, ')')
          await factoryAudioRef.current.play()
          setIsFactoryPlaying(true)
          console.log('🏭 [playFactoryAudioInternal] 오디오 재생 성공')
        } else {
          console.log('🏭 [playFactoryAudioInternal] 오디오가 이미 재생 중입니다')
        }

        // 볼륨 초기화
        factoryAudioRef.current.volume = 0
        console.log('🏭 [playFactoryAudioInternal] 볼륨 0으로 초기화')

        console.log('🏭 [Factory 오디오] 재생 시작 - 페이드인 3초 → 지속 4초 → 페이드아웃 3초')

        // 페이드 인 (0 → 1, 3초)
        fadeFactoryVolume(1, 3000)
        await new Promise(resolve => setTimeout(resolve, 3000))
        console.log('🏭 [playFactoryAudioInternal] 페이드인 완료')

        // 지속 (1, 4초)
        await new Promise(resolve => setTimeout(resolve, 4000))
        console.log('🏭 [playFactoryAudioInternal] 지속 완료')

        // 페이드 아웃 (1 → 0, 3초)
        fadeFactoryVolume(0, 3000)
        await new Promise(resolve => setTimeout(resolve, 3000))
        console.log('🏭 [playFactoryAudioInternal] 페이드아웃 완료')

        // 재생 완료 - 멈춘 위치를 저장하고 일시정지
        if (factoryAudioRef.current && isMounted) {
          // 현재 재생 위치를 저장 (루핑을 위해)
          factoryPausedTimeRef.current = factoryAudioRef.current.currentTime
          console.log('🏭 [Factory 오디오] 멈춘 위치 저장:', factoryPausedTimeRef.current, '초')
          
          factoryAudioRef.current.pause()
          factoryAudioRef.current.volume = 1
          setIsFactoryPlaying(false)
          // 플래그를 먼저 false로 설정하여 다음 사이클 시작 가능하도록 함
          isFactoryPlayingRef.current = false
          console.log('🏭 [Factory 오디오] 재생 완료 (일시정지, 루핑 대기)')
          
          // 재생 완료 후 motor 상태 확인 - 계속 true면 자동으로 다음 사이클 재생
          // DB를 직접 확인하여 최신 상태 확인
          const isMotorTrue = await checkMotorState()
          console.log('🏭 [Factory 오디오] 재생 완료 후 motor 상태 확인:', isMotorTrue)
          
          if (isMotorTrue) {
            console.log('🏭 [Factory 오디오] motor가 계속 true → 다음 사이클 자동 재생 시작')
            // 플래그가 false로 설정되어 있고, 컴포넌트가 마운트되어 있으면 바로 다음 사이클 시작
            // 약간의 딜레이를 두어 자연스러운 연속 재생
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // 다시 한 번 상태 확인
            if (isMounted && !isFactoryPlayingRef.current && factoryAudioRef.current) {
              const currentIsMotorTrue = await checkMotorState()
              console.log('🏭 [Factory 오디오] motor 상태 재확인:', currentIsMotorTrue)
              console.log('🏭 [Factory 오디오] 다음 사이클 시작 조건:', {
                isMounted,
                isFactoryPlayingRef: isFactoryPlayingRef.current,
                hasFactoryAudioRef: !!factoryAudioRef.current,
                currentIsMotorTrue
              })
              
              if (currentIsMotorTrue && isMounted && !isFactoryPlayingRef.current && factoryAudioRef.current) {
                console.log('🏭 [Factory 오디오] 다음 사이클 시작!')
                playFactoryAudioInternal()
              } else {
                console.log('🏭 [Factory 오디오] 다음 사이클 시작 조건 불만족')
              }
            } else {
              console.log('🏭 [Factory 오디오] 다음 사이클 시작 조건 불만족 (초기 체크)')
            }
          } else {
            console.log('🏭 [Factory 오디오] motor가 false → 재생 중지')
          }
        }
      } catch (error) {
        console.error('🏭 [playFactoryAudioInternal] Factory 오디오 재생 실패:', error)
        if (isMounted) {
          setIsFactoryPlaying(false)
          isFactoryPlayingRef.current = false
        }
      }
    }

    waitForFirebase()
      .then((firebase) => {
        console.log('🏭 [Firebase] waitForFirebase Promise resolved, firebase:', firebase)
        if (!isMounted) {
          console.log('🏭 [Firebase] 컴포넌트가 언마운트되어 초기화 중단')
          return
        }

        // Firebase SDK가 없으면 fetch 방식으로 폴백
        if (!firebase || !firebase.database) {
          console.log('🏭 [Firebase] Firebase SDK를 사용할 수 없습니다. fetch 방식으로 전환합니다.')
          fetchIntervalId = setupFetchBasedListener()
          return
        }

        console.log('🏭 [Firebase] Firebase database 초기화 시작')
        console.log('🏭 [Firebase] firebase 객체:', firebase)
        const database = firebase.database()
        console.log('🏭 [Firebase] Database 인스턴스:', database)
        
        if (!database) {
          console.error('🏭 [Firebase] Database 인스턴스를 가져올 수 없습니다')
          fetchIntervalId = setupFetchBasedListener()
          return
        }
        
        const dbUrl = 'https://yencctv-10945-default-rtdb.asia-southeast1.firebasedatabase.app'
        console.log('🏭 [Firebase] Database URL:', dbUrl)

        // Motor 상태 변경 핸들러
        const handleMotorStateChange = (motor1Value: boolean, motor2Value: boolean) => {
      console.log('🏭 [Motor 실시간 리스너] motor_1:', motor1Value, 'motor_2:', motor2Value)
      console.log('🏭 [Factory 오디오 상태] isFactoryPlayingRef:', isFactoryPlayingRef.current, 'paused:', factoryAudioRef.current?.paused)

      if (!isMounted || !factoryAudioRef.current) {
        console.log('🏭 [Motor 실시간 리스너] 컴포넌트가 마운트되지 않았거나 오디오 ref가 없음')
        return
      }

      const isTrue = motor1Value === true || motor2Value === true
      const wasTrue = lastMotor1Value === true || lastMotor2Value === true

      // 값 업데이트
      lastMotor1Value = motor1Value
      lastMotor2Value = motor2Value

      // motor_1 또는 motor_2가 true인 경우
      if (isTrue) {
        // false에서 true로 변경된 경우 (새로 true가 된 경우)
        if (!wasTrue) {
          console.log('🏭 [Motor 실시간 리스너] motor_1 또는 motor_2가 false에서 true로 변경됨')
          motorTrueStartTime = Date.now()
          console.log('🏭 [Firebase DB] true 시작 시간 기록:', motorTrueStartTime)
          
          // 기존 타이머가 있으면 취소
          if (motorTrueTimerRef) {
            clearTimeout(motorTrueTimerRef)
            motorTrueTimerRef = null
          }

          // 현재 재생 중이 아니면 3초 후 재생 시작
          if (!isFactoryPlayingRef.current) {
            console.log('🏭 [Firebase DB] motor_1 또는 motor_2=true → 3초 후 Factory 오디오 재생 시작')
            motorTrueTimerRef = setTimeout(() => {
              // 3초 후에도 여전히 true이고 재생 중이 아니면 재생 시작
              const currentIsTrue = lastMotor1Value === true || lastMotor2Value === true
              if (isMounted && currentIsTrue && !isFactoryPlayingRef.current && factoryAudioRef.current) {
                const elapsed = Date.now() - (motorTrueStartTime || 0)
                if (elapsed >= 3000) {
                  console.log('🏭 [Firebase DB] 3초 이상 유지 확인 완료 (', elapsed, 'ms) → Factory 오디오 재생 시작')
                  playFactoryAudioInternal()
                } else {
                  console.log('🏭 [Firebase DB] 3초 미만 유지 (', elapsed, 'ms) → 재생 취소')
                }
              } else {
                console.log('🏭 [Firebase DB] 3초 후 false로 변경됨 또는 이미 재생 중 → 재생 취소')
              }
              motorTrueTimerRef = null
              motorTrueStartTime = null
            }, 3000)
          } else {
            console.log('🏭 [Firebase DB] Factory 오디오가 이미 재생 중입니다')
            motorTrueStartTime = null
          }
        } else {
          // 이미 true였던 경우 (계속 true)
          console.log('🏭 [Motor 실시간 리스너] motor_1 또는 motor_2가 계속 true입니다')
        }
      } else {
        console.log('🏭 [Motor 실시간 리스너] motor_1과 motor_2 모두 false입니다')
        
        // true에서 false로 변경된 경우
        if (wasTrue) {
          console.log('🏭 [Firebase DB] true에서 false로 변경됨 → 재생 시작 타이머 취소')
          if (motorTrueTimerRef) {
            clearTimeout(motorTrueTimerRef)
            motorTrueTimerRef = null
          }
          motorTrueStartTime = null
        }
        
        // 둘 다 false인 경우 - 재생 중이면 중지하지 않고 현재 사이클이 완료될 때까지 대기
        // (재생이 완료되면 자동으로 중지되므로 여기서는 아무것도 하지 않음)
        if (isFactoryPlayingRef.current && !factoryAudioRef.current.paused) {
          console.log('🏭 [Firebase DB] motor_1과 motor_2 모두 false이지만, 현재 재생 중인 사이클이 완료될 때까지 대기합니다')
          // 재생 중인 사이클은 완료되도록 두고, 완료 후에는 자동으로 중지됨
        }
      }
    }

        // Firebase Realtime Database 실시간 리스너 설정
        const motorState = { motor1: false, motor2: false }

        try {
          console.log('🏭 [Firebase] motor_1 리스너 설정 시도...')
          motor1Ref = database.ref('motor_1')
          console.log('🏭 [Firebase] motor_1 ref 생성 완료:', motor1Ref)
          
          motor1Ref.on('value', (snapshot: any) => {
            console.log('🏭 [Motor_1 리스너] 이벤트 발생!')
            if (!isMounted) {
              console.log('🏭 [Motor_1 리스너] 컴포넌트가 언마운트됨')
              return
            }
            const value = snapshot.val()
            motorState.motor1 = value === true
            console.log('🏭 [Motor_1 리스너] 값 변경:', value, '→ boolean:', motorState.motor1)
            handleMotorStateChange(motorState.motor1, motorState.motor2)
          }, (error: any) => {
            console.error('🏭 [Motor_1 리스너] 오류:', error)
          })

          console.log('🏭 [Firebase] motor_2 리스너 설정 시도...')
          motor2Ref = database.ref('motor_2')
          console.log('🏭 [Firebase] motor_2 ref 생성 완료:', motor2Ref)
          
          motor2Ref.on('value', (snapshot: any) => {
            console.log('🏭 [Motor_2 리스너] 이벤트 발생!')
            if (!isMounted) {
              console.log('🏭 [Motor_2 리스너] 컴포넌트가 언마운트됨')
              return
            }
            const value = snapshot.val()
            motorState.motor2 = value === true
            console.log('🏭 [Motor_2 리스너] 값 변경:', value, '→ boolean:', motorState.motor2)
            handleMotorStateChange(motorState.motor1, motorState.motor2)
          }, (error: any) => {
            console.error('🏭 [Motor_2 리스너] 오류:', error)
          })

          console.log('🏭 [Firebase] 실시간 리스너 설정 완료!')
        } catch (error) {
          console.error('🏭 [Firebase] 실시간 리스너 설정 실패:', error)
        }
      })
      .catch((error) => {
        console.error('🏭 [Firebase] 초기화 실패:', error)
        console.log('🏭 [Firebase] fetch 방식으로 전환합니다.')
        fetchIntervalId = setupFetchBasedListener()
      })

    // Fetch 기반 리스너 (Firebase SDK가 없을 때 사용)
    const setupFetchBasedListener = (): NodeJS.Timeout => {
      console.log('🏭 [Fetch 리스너] Fetch 기반 리스너 설정 시작')
      let fetchLastMotor1Value: boolean | null = null
      let fetchLastMotor2Value: boolean | null = null

      const checkMotorState = async () => {
        if (!isMounted) return

        try {
          const [motor1Response, motor2Response] = await Promise.all([
            fetch('https://yencctv-10945-default-rtdb.asia-southeast1.firebasedatabase.app/motor_1.json'),
            fetch('https://yencctv-10945-default-rtdb.asia-southeast1.firebasedatabase.app/motor_2.json')
          ])

          const motor1Value = await motor1Response.json() === true
          const motor2Value = await motor2Response.json() === true

          const isTrue = motor1Value === true || motor2Value === true
          const wasTrue = fetchLastMotor1Value === true || fetchLastMotor2Value === true

          // 값이 변경되었을 때만 처리
          if (fetchLastMotor1Value !== motor1Value || fetchLastMotor2Value !== motor2Value) {
            console.log('🏭 [Fetch 리스너] 값 변경 감지! motor_1:', motor1Value, 'motor_2:', motor2Value)
            fetchLastMotor1Value = motor1Value
            fetchLastMotor2Value = motor2Value
            
            if (!isMounted || !factoryAudioRef.current) return

            // motor_1 또는 motor_2가 true인 경우
            if (isTrue) {
              // false에서 true로 변경된 경우 (새로 true가 된 경우)
              if (!wasTrue) {
                console.log('🏭 [Fetch 리스너] motor_1 또는 motor_2가 false에서 true로 변경됨')
                motorTrueStartTime = Date.now()
                console.log('🏭 [Fetch 리스너] true 시작 시간 기록:', motorTrueStartTime)
                
                // 기존 타이머가 있으면 취소
                if (motorTrueTimerRef) {
                  clearTimeout(motorTrueTimerRef)
                  motorTrueTimerRef = null
                }

                // 현재 재생 중이 아니면 3초 후 재생 시작
                if (!isFactoryPlayingRef.current) {
                  console.log('🏭 [Fetch 리스너] motor_1 또는 motor_2=true → 3초 후 Factory 오디오 재생 시작')
                  motorTrueTimerRef = setTimeout(() => {
                    // 3초 후에도 여전히 true이고 재생 중이 아니면 재생 시작
                    const currentIsTrue = fetchLastMotor1Value === true || fetchLastMotor2Value === true
                    if (isMounted && currentIsTrue && !isFactoryPlayingRef.current && factoryAudioRef.current) {
                      const elapsed = Date.now() - (motorTrueStartTime || 0)
                      if (elapsed >= 3000) {
                        console.log('🏭 [Fetch 리스너] 3초 이상 유지 확인 완료 (', elapsed, 'ms) → Factory 오디오 재생 시작')
                        playFactoryAudioInternal()
                      } else {
                        console.log('🏭 [Fetch 리스너] 3초 미만 유지 (', elapsed, 'ms) → 재생 취소')
                      }
                    } else {
                      console.log('🏭 [Fetch 리스너] 3초 후 false로 변경됨 또는 이미 재생 중 → 재생 취소')
                    }
                    motorTrueTimerRef = null
                    motorTrueStartTime = null
                  }, 3000)
                } else {
                  console.log('🏭 [Fetch 리스너] Factory 오디오가 이미 재생 중입니다')
                  motorTrueStartTime = null
                }
              } else {
                // 이미 true였던 경우 (계속 true)
                console.log('🏭 [Fetch 리스너] motor_1 또는 motor_2가 계속 true입니다')
              }
            } else {
              console.log('🏭 [Fetch 리스너] motor_1과 motor_2 모두 false입니다 (재생 중이면 사이클 완료 대기)')
              
              // true에서 false로 변경된 경우
              if (wasTrue) {
                console.log('🏭 [Fetch 리스너] true에서 false로 변경됨 → 재생 시작 타이머 취소')
                if (motorTrueTimerRef) {
                  clearTimeout(motorTrueTimerRef)
                  motorTrueTimerRef = null
                }
                motorTrueStartTime = null
              }
            }
          }
        } catch (error) {
          console.error('🏭 [Fetch 리스너] 오류:', error)
        }
      }

      // 즉시 한 번 실행
      checkMotorState()
      // 200ms마다 확인 (거의 실시간)
      const intervalId = setInterval(checkMotorState, 200)
      return intervalId
    }

    return () => {
      console.log('🏭 [Firebase] cleanup 함수 실행')
      isMounted = false
      // 리스너 제거
      if (motor1Ref) {
        console.log('🏭 [Firebase] motor_1 리스너 제거')
        motor1Ref.off('value')
      }
      if (motor2Ref) {
        console.log('🏭 [Firebase] motor_2 리스너 제거')
        motor2Ref.off('value')
      }
      if (fetchIntervalId) {
        console.log('🏭 [Firebase] fetch interval 제거')
        clearInterval(fetchIntervalId)
      }
      if (motorTrueTimerRef) {
        console.log('🏭 [Firebase] motor true timer 제거')
        clearTimeout(motorTrueTimerRef)
      }
      if (factoryVolumeIntervalRef.current) {
        clearInterval(factoryVolumeIntervalRef.current)
      }
      if (factoryPlayTimerRef.current) {
        clearTimeout(factoryPlayTimerRef.current)
      }
    }
  }, [])

  // Factory 오디오 루핑 감지 및 멈춘 위치 초기화
  useEffect(() => {
    const factoryAudio = factoryAudioRef.current
    if (!factoryAudio) return

    let lastCurrentTime = factoryAudio.currentTime

    const handleTimeUpdate = () => {
      if (!factoryAudio) return

      // 오디오가 루핑되면 (currentTime이 이전보다 작아지면) 멈춘 위치 초기화
      if (factoryAudio.currentTime < lastCurrentTime - 1) {
        // 1초 이상 뒤로 돌아갔으면 루핑된 것으로 간주
        factoryPausedTimeRef.current = 0
        console.log('🏭 [Factory 오디오] 루핑 감지 - 멈춘 위치 초기화')
      }
      lastCurrentTime = factoryAudio.currentTime
    }

    factoryAudio.addEventListener('timeupdate', handleTimeUpdate)

    return () => {
      factoryAudio.removeEventListener('timeupdate', handleTimeUpdate)
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

  // 오디오 데이터 가져오기
  const audio = dotlineAudio[0] // sound.mp3
  const factoryAudio = dotlineAudio[1] // factory.mp3

  return (
    <Container>
      <PlayPauseButton onClick={togglePlay}>
        {isPlaying ? '⏸️' : '▶️'}
      </PlayPauseButton>
      <AudioStatusContainer>
        <AudioStatusItem isPlaying={isPlaying}>
          <PlayingIndicator isPlaying={isPlaying} />
          <AudioStatusText>점선면 음악 (sound.mp3)</AudioStatusText>
        </AudioStatusItem>
        <AudioStatusItem isPlaying={isFactoryPlaying}>
          <PlayingIndicator isPlaying={isFactoryPlaying} />
          <AudioStatusText>팩토리 음악 (factory.mp3)</AudioStatusText>
        </AudioStatusItem>
      </AudioStatusContainer>
      <HiddenAudio
        ref={audioRef}
        src={audio.src}
        loop // 무한 반복
      />
      <HiddenAudio
        ref={factoryAudioRef}
        src={factoryAudio.src}
        preload="auto"
        loop // 루핑 활성화
        onLoadedData={() => {
          console.log('🏭 [Factory 오디오] 오디오 파일 로드 완료:', factoryAudio.src)
        }}
        onError={(e) => {
          console.error('🏭 [Factory 오디오] 오디오 파일 로드 실패:', e)
        }}
      />
    </Container>
  )
}
