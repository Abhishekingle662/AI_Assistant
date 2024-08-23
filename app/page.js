'use client'
import { Box, Fab, Stack, TextField, Typography, useMediaQuery, CssBaseline } from '@mui/material'
import { useState, useMemo } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import SendIcon from '@mui/icons-material/Send'
import MicIcon from '@mui/icons-material/Mic'
import StopIcon from '@mui/icons-material/Stop'
import { keyframes } from '@mui/system'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

export default function Home() {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I'm an AI Customer Support Bot. How can I help you today?",
        },
    ])
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [mode, setMode] = useState('light')
    
    const isMobile = useMediaQuery('(max-width:600px)')
    const [isRecording, setIsRecording] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState(null)

    const theme = useMemo(
        () =>
          createTheme({
            palette: {
              mode,
            },
          }),
        [mode],
    )

    const sendMessage = async () => {
        if (!message.trim() || isLoading) return;
        setIsLoading(true)

        setMessage('')
        setMessages((messages) => [
            ...messages,
            { role: 'user', content: message },
            { role: 'assistant', content: '' },
        ])

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([...messages, { role: 'user', content: message }]),
            })

            if (!response.ok) {
                throw new Error('Network response was not ok')
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                const text = decoder.decode(value, { stream: true })
                setMessages((messages) => {
                    let lastMessage = messages[messages.length - 1]
                    let otherMessages = messages.slice(0, messages.length - 1)
                    return [
                        ...otherMessages,
                        { ...lastMessage, content: lastMessage.content + text },
                    ]
                })
            }
        } catch (error) {
            console.error('Error:', error)
            setMessages((messages) => [
                ...messages,
                { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
            ])
        }
        setIsLoading(false)
    }

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            sendMessage()
        }
    }

    const handleRecording = async () => {
        if (isRecording) {
            mediaRecorder.stop()
            setIsRecording(false)
            return
        }
    
        setIsRecording(true)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const recorder = new MediaRecorder(stream)
            setMediaRecorder(recorder)
            const audioChunks = []
    
            recorder.addEventListener("dataavailable", event => {
                audioChunks.push(event.data)
            })
    
            recorder.addEventListener("stop", async () => {
                const audioBlob = new Blob(audioChunks)
                const audioFile = new File([audioBlob], "audio.webm")
                console.log("Audio file ready to be sent to API", audioFile)
                setIsRecording(false)
                
                // Send audio file to speech-to-text API
                const formData = new FormData()
                formData.append('audio', audioFile)
                
                try {
                    const response = await fetch('/api/speech-to-text', {
                        method: 'POST',
                        body: formData,
                    })
                    
                    if (!response.ok) {
                        throw new Error('Speech-to-text API response was not ok')
                    }
                    
                    const { text } = await response.json()
                    console.log("Transcribed text:", text)
                    
                    // Send transcribed text to chat API
                    sendMessage(text)
                } catch (error) {
                    console.error("Error processing speech to text:", error)
                    setMessages((messages) => [
                        ...messages,
                        { role: 'assistant', content: "I'm sorry, but I encountered an error processing your voice input. Please try again." },
                    ])
                }
            })
    
            recorder.start()
        } catch (err) {
            console.error("Error accessing microphone:", err)
            setIsRecording(false)
        }
    }

    const toggleColorMode = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                width="100vw"
                height="100vh"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                sx={{
                    backgroundImage: 'url("https://media.giphy.com/media/vTr3WiTdqpL6GOT5mF/giphy.gif")',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                }}
            >
                <Fab
                    color="primary"
                    onClick={toggleColorMode}
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                    }}
                >
                    {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </Fab>

                <Stack
                    direction={'column'}
                    width={isMobile ? "100%" : "600px"}
                    height={isMobile ? "100vh" : "80vh"}
                    border={isMobile ? "none" : "1px solid"}
                    borderColor="divider"
                    borderRadius={isMobile ? 0 : 2}
                    p={isMobile ? 1 : 2}
                    spacing={2}
                    bgcolor="background.paper"
                    sx={{
                        animation: `${fadeIn} 0.5s ease-out`,
                    }}
                >
                    <Typography variant={isMobile ? "h5" : "h4"} align="center" color="secondary">
                        AI Customer Support
                    </Typography>
                    <Stack
                        direction={'column'}
                        spacing={2}
                        flexGrow={1}
                        overflow="auto"
                        maxHeight={isMobile ? "calc(100% - 140px)" : "calc(100% - 120px)"}
                    >
                        {messages.map((message, index) => (
                            <Box
                                key={index}
                                display="flex"
                                justifyContent={
                                    message.role === 'assistant' ? 'flex-start' : 'flex-end'
                                }
                                sx={{
                                    animation: `${fadeIn} 0.3s ease-out`,
                                }}
                            >
                                <Box
                                    bgcolor={
                                        message.role === 'assistant'
                                            ? 'primary.main'
                                            : 'secondary.main'
                                    }
                                    color="white"
                                    borderRadius={16}
                                    p={1.5}
                                    maxWidth={isMobile ? "85%" : "70%"}
                                >
                                    <Typography variant={isMobile ? "body2" : "body1"}>
                                        {message.content}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Stack>
                    <Stack direction={'row'} spacing={1} alignItems="flex-end">
                        <TextField
                            label="Message"
                            fullWidth
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading || isRecording}
                            multiline
                            maxRows={4}
                            size={isMobile ? "small" : "medium"}
                        />
                        <Fab
                            color="secondary"
                            onClick={handleRecording}
                            disabled={isLoading}
                            size={isMobile ? "small" : "medium"}
                            aria-label={isRecording ? "Stop recording" : "Start voice recording"}
                            aria-pressed={isRecording}
                            aria-live="polite"
                            sx={{
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'scale(1.1)',
                                },
                                '&:active': {
                                    transform: 'scale(0.9)',
                                },
                                animation: isRecording ? `${pulse} 1s infinite` : 'none',
                            }}
                        >
                            {isRecording ? <StopIcon /> : <MicIcon />}
                        </Fab>
                        <Fab
                            color="primary"
                            onClick={sendMessage}
                            disabled={isLoading || isRecording}
                            size={isMobile ? "small" : "medium"}
                            sx={{
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'scale(1.1)',
                                },
                                '&:active': {
                                    transform: 'scale(0.9)',
                                },
                            }}
                        >
                            <SendIcon />
                        </Fab>
                    </Stack>
                </Stack>
            </Box>
        </ThemeProvider>
    )
}
