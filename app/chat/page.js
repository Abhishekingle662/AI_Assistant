'use client'
// Import necessary components and icons from Material-UI and React
import { Box, Fab, Stack, TextField, Typography, useMediaQuery, CssBaseline } from '@mui/material'
import { useState, useMemo } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import SendIcon from '@mui/icons-material/Send'
// import MicIcon from '@mui/icons-material/Mic'
// import StopIcon from '@mui/icons-material/Stop'
import { keyframes } from '@mui/system'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import HomeIcon from '@mui/icons-material/Home'
import { useRouter } from 'next/navigation'

// Define keyframe animations for visual effects
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
    // Initialize state variables
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I'm an AI Customer Support Bot. How can I help you today?",
        },
    ])
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [mode, setMode] = useState('light')
    
    // Check if the device is mobile
    const isMobile = useMediaQuery('(max-width:600px)')
    const [isRecording, setIsRecording] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState(null)

    const router = useRouter()

    // Create a theme based on the current mode (light/dark)
    const theme = useMemo(
        () =>
          createTheme({
            palette: {
              mode,
            },
          }),
        [mode],
    )

// formatting the text reply from the chatbot
    const formatMessage = (content) => {
        const lines = content.split('•').filter(line => line.trim() !== '');
        
        if (lines.length > 1) {
          return (
            <ul>
              {lines.map((line, index) => (
                <li key={index}>{line.trim()}</li>
              ))}
            </ul>
          );
        } else {
          return <span>{content}</span>;
        }
      };


    // Function to send a message to the AI
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
            // Send the message to the API
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

            // Read the streaming response
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

    // Handle Enter key press to send message
    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            sendMessage()
        }
    }

    // Handle voice recording
    // const handleRecording = async () => {
    //     if (isRecording) {
    //         mediaRecorder.stop()
    //         setIsRecording(false)
    //         return
    //     }
    
    //     setIsRecording(true)
    //     try {
    //         // Request microphone access and set up MediaRecorder
    //         const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    //         const recorder = new MediaRecorder(stream)
    //         setMediaRecorder(recorder)
    //         const audioChunks = []
    
    //         recorder.addEventListener("dataavailable", event => {
    //             audioChunks.push(event.data)
    //         })
    
    //         recorder.addEventListener("stop", async () => {
    //             // Process the recorded audio
    //             const audioBlob = new Blob(audioChunks)
    //             const audioFile = new File([audioBlob], "audio.webm")
    //             console.log("Audio file ready to be sent to API", audioFile)
    //             setIsRecording(false)
                
    //             // Send audio file to speech-to-text API
    //             const formData = new FormData()
    //             formData.append('audio', audioFile)
                
    //             try {
    //                 const response = await fetch('/api/speech-to-text', {
    //                     method: 'POST',
    //                     body: formData,
    //                 })
                    
    //                 if (!response.ok) {
    //                     throw new Error('Speech-to-text API response was not ok')
    //                 }
                    
    //                 const { text } = await response.json()
    //                 console.log("Transcribed text:", text)
                    
    //                 // Send transcribed text to chat API
    //                 sendMessage(text)
    //             } catch (error) {
    //                 console.error("Error processing speech to text:", error)
    //                 setMessages((messages) => [
    //                     ...messages,
    //                     { role: 'assistant', content: "I'm sorry, but I encountered an error processing your voice input. Please try again." },
    //                 ])
    //             }
    //         })
    
    //         recorder.start()
    //     } catch (err) {
    //         console.error("Error accessing microphone:", err)
    //         setIsRecording(false)
    //     }
    // }

    // Toggle between light and dark mode
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
                {/* Theme toggle button */}
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

                {/* Home button */}
                <Fab
                    color="primary"
                    onClick={() => router.push('/')}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                        position: 'absolute',
                        top: isMobile ? 8 : 16,
                        left: isMobile ? 8 : 16,
                    }}
                >
                    {mode === 'dark' ? <HomeIcon fontSize={isMobile ? "small" : "medium"} /> : <HomeIcon fontSize={isMobile ? "small" : "medium"} />}
                </Fab>



                {/* Main chat container */}
                <Stack
                    direction={'column'}
                    width={isMobile ? "100%" : "800px"}
                    height={isMobile ? "100vh" : "90vh"}
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
                    {/* Title */}
                    <Typography variant={isMobile ? "h5" : "h4"} align="center" color="secondary">
                        AI Customer Support
                    </Typography>

                    
                    {/* Chat messages */}
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
                                    borderRadius={5}
                                    p={1.5}
                                    maxWidth={isMobile ? "85%" : "70%"}
                                >
                                    <Typography variant={isMobile ? "body2" : "body1"}>
                                        {formatMessage(message.content)}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Stack>
                    {/* Input area */}
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

                        {/* Voice recording button (commented out) */}
                        {/* <Fab
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
                        </Fab> */}

                        {/* Send message button */}
                        <Fab
                            color="primary"
                            onClick={sendMessage}
                            disabled={isLoading || isRecording}
                            size={isMobile ? "small" : "medium"}
                            sx={{
                                transition: 'transform 0.3s',
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
