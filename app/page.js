'use client'
import { Box, Fab, Stack, TextField, Typography, useMediaQuery } from '@mui/material'
import { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import SendIcon from '@mui/icons-material/Send'

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#3f51b5' },
    secondary: { main: '#f50057' },
    background: { default: '#f5f5f5', paper: '#ffffff' },
  },
})

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#f48fb1' },
    background: { default: '#303030', paper: '#424242' },
  },
})

export default function Home() {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I'm an AI Customer Support Bot. How can I help you today?",
        },
    ])
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
    const theme = prefersDarkMode ? darkTheme : lightTheme
    const isMobile = useMediaQuery('(max-width:600px)');

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

    return (
        <ThemeProvider theme={theme}>
            <Box
                width="100vw"
                height="100vh"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                bgcolor="background.default"
            >
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
                >
                    <Typography variant={isMobile ? "h5" : "h4"} align="center" color="primary">
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
                            disabled={isLoading}
                            multiline
                            maxRows={4}
                            size={isMobile ? "small" : "medium"}
                        />
                        <Fab
                            color="primary"
                            onClick={sendMessage}
                            disabled={isLoading}
                            size={isMobile ? "small" : "medium"}
                        >
                            <SendIcon />
                        </Fab>
                    </Stack>
                </Stack>
            </Box>
        </ThemeProvider>
    )
}
