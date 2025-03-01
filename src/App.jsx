import { useState, useEffect } from 'react';
import { Box, Container, Spinner, Center, Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton, useDisclosure } from '@chakra-ui/react';
import GameBoard from './components/GameBoard';
import UserForm from './components/UserForm';
import { fetchUserProfile } from './utils/api';

function App() {
  const [username, setUsername] = useState('');
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [inviterInfo, setInviterInfo] = useState(null);
  const { isOpen: isAlertOpen, onClose: onAlertClose, onOpen: onAlertOpen } = useDisclosure();

  useEffect(() => {
    // Check for inviter in URL params
    const params = new URLSearchParams(window.location.search);
    const inviter = params.get('inviter');
    
    if (inviter) {
      // Fetch inviter's profile
      const fetchInviterProfile = async () => {
        try {
          const data = await fetchUserProfile(inviter);
          setInviterInfo({
            username: inviter,
            score: data.score,
            totalAttempts: data.total_attempts || 0,
            destinations: data.destinations_solved || []
          });
          onAlertOpen();
          console.log(`${inviter} has invited you! Their score: ${data.score}/${data.total_attempts}`);
        } catch (error) {
          console.error('Error fetching inviter profile:', error);
        }
      };
      
      fetchInviterProfile();
    }
    
    // Check for stored username in localStorage
    const storedUsername = localStorage.getItem('globetrotter_username');
    if (storedUsername) {
      setUsername(storedUsername);
      
      // Fetch user profile
      const fetchUserData = async () => {
        try {
          const data = await fetchUserProfile(storedUsername);
          setScore(data.score);
          setTotalAttempts(data.total_attempts || 0);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // If user not found, clear localStorage
          if (error.response && error.response.status === 404) {
            localStorage.removeItem('globetrotter_username');
            setUsername('');
          }
        }
      };
      
      fetchUserData();
    }
    
    setLoading(false);
  }, [onAlertOpen]);

  const handleUserRegistered = (newUsername, initialScore, initialAttempts) => {
    setUsername(newUsername);
    setScore(initialScore);
    setTotalAttempts(initialAttempts);
    localStorage.setItem('globetrotter_username', newUsername);
  };

  const updateScoreAndAttempts = (newScore, newTotalAttempts) => {
    setScore(newScore);
    setTotalAttempts(newTotalAttempts);
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <Container maxW="container.lg" py={5}>
      {isAlertOpen && inviterInfo && (
        <Alert 
          status="info" 
          variant="subtle" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          textAlign="center" 
          mb={5}
          p={4}
          borderRadius="md"
          boxShadow="md"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={2} fontSize="lg">
            Challenge Invitation!
          </AlertTitle>
          <AlertDescription maxWidth="md">
            <Box>
              <strong>{inviterInfo.username}</strong> has challenged you to beat their score of <strong>{inviterInfo.score}/{inviterInfo.totalAttempts}</strong>!
            </Box>
            {inviterInfo.destinations.length > 0 && (
              <Box mt={2}>
                They've successfully guessed destinations including: {inviterInfo.destinations.slice(0, 3).map(d => `${d.city}`).join(', ')}
                {inviterInfo.destinations.length > 3 ? ' and more!' : ''}
              </Box>
            )}
          </AlertDescription>
          <CloseButton
            position="absolute"
            right="8px"
            top="8px"
            onClick={onAlertClose}
          />
        </Alert>
      )}
      
      {username ? (
        <GameBoard 
          username={username} 
          score={score}
          totalAttempts={totalAttempts}
          updateScoreAndAttempts={updateScoreAndAttempts}
          inviterInfo={inviterInfo}
        />
      ) : (
        <UserForm 
          onUserRegistered={handleUserRegistered} 
          inviterInfo={inviterInfo}
        />
      )}
    </Container>
  );
}

export default App;
