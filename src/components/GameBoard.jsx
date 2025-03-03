import { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Button, 
  SimpleGrid, 
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useDisclosure,
  Fade,
  ScaleFade,
  Image,
  Badge,
  HStack,
  Tooltip,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import Confetti from 'react-confetti';
import ChallengeModal from './ChallengeModal';
import { fetchRandomDestination, submitGuess } from '../utils/api';

// Define animations
const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
  40% {transform: translateY(-30px);}
  60% {transform: translateY(-15px);}
`;

const shake = keyframes`
  0%, 100% {transform: translateX(0);}
  10%, 30%, 50%, 70%, 90% {transform: translateX(-10px);}
  20%, 40%, 60%, 80% {transform: translateX(10px);}
`;

const fadeInOut = keyframes`
  0% {opacity: 0; transform: scale(0.5);}
  50% {opacity: 1; transform: scale(1.2);}
  100% {opacity: 0; transform: scale(0.5);}
`;

const GameBoard = ({ username, score, totalAttempts, updateScoreAndAttempts, inviterInfo }) => {
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSadFace, setShowSadFace] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const getRandomDestination = async () => {
    setLoading(true);
    setResult(null);
    setSelectedOption(null);
    setShowConfetti(false);
    setShowSadFace(false);
    setIsAnimating(false);
    
    try {
      const data = await fetchRandomDestination();
      setDestination(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch destination. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRandomDestination();
  }, []);

  const handleGuess = async (guess) => {
    
    setSelectedOption(guess);
    setIsAnimating(true);
    
    try {
      const data = await submitGuess(destination.correct_city, guess, username);
      
      if (data.new_score !== undefined && data.total_attempts !== undefined) {
        updateScoreAndAttempts(data.new_score, data.total_attempts);
      }
      setResult(data);
      if (data.correct) {
        // Correct answer feedback
        setShowConfetti(true);
        playCorrectSound();
        
        // Check if user has beaten the inviter's score
        if (inviterInfo && data.new_score > inviterInfo.score && data.new_score - 1 <= inviterInfo.score) {
          toast({
            title: '🏆 Challenge Completed!',
            description: `Congratulations! You've beaten ${inviterInfo.username}'s score of ${inviterInfo.score}/${inviterInfo.totalAttempts}!`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }
        
        setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
      } else {
        // Incorrect answer feedback
        setShowSadFace(true);
        playIncorrectSound();
        
        setTimeout(() => {
          setShowSadFace(false);
        }, 3000);
      }
      
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit guess. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
    }
  };

  const playCorrectSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
      audio.volume = 0.5;
      audio.play();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const playIncorrectSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/132/132-preview.mp3');
      audio.volume = 0.5;
      audio.play();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  // Calculate accuracy percentage
  const accuracy = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;

  if (loading) {
    return (
      <Box textAlign="center" p={5}>
        <Text>Loading destination...</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch" p={5} className="fade-in">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      <Heading as="h1" size="xl" textAlign="center" color="brand.700">
        Globetrotter Challenge
      </Heading>
      
      <StatGroup>
        <Tooltip label="Correct answers out of total attempts" hasArrow>
          <Stat>
            <StatLabel>Score</StatLabel>
            <StatNumber>{score}/{totalAttempts} <Badge colorScheme={accuracy > 70 ? "green" : accuracy > 40 ? "yellow" : "red"}>{accuracy}%</Badge></StatNumber>
          </Stat>
        </Tooltip>
        
        {username && (
          <Stat>
            <StatLabel>Player</StatLabel>
            <StatNumber>{username}</StatNumber>
          </Stat>
        )}
        
        {inviterInfo && (
          <Tooltip label="Challenge score to beat" hasArrow>
            <Stat>
              <StatLabel>
                <HStack>
                  <Text>Challenge</Text>
                  <Badge colorScheme="blue">Beat {inviterInfo.score}/{inviterInfo.totalAttempts}</Badge>
                </HStack>
              </StatLabel>
              <StatNumber>{inviterInfo.username}</StatNumber>
            </Stat>
          </Tooltip>
        )}
      </StatGroup>
      
      <Box bg="brand.50" p={5} borderRadius="md" boxShadow="md">
        <Heading as="h2" size="md" mb={4}>
          Guess the Destination
        </Heading>
        
        <VStack align="start" spacing={3}>
          {destination?.clues.map((clue, index) => (
            <Text key={index} fontStyle="italic">
              Clue {index + 1}: {clue}
            </Text>
          ))}
        </VStack>
      </Box>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {destination?.options.map((option, index) => (
          <Button
            key={index}
            size="lg"
            colorScheme={
              result
                ? option === destination.correct_city
                  ? 'green'
                  : selectedOption === option
                    ? 'red'
                    : 'blue'
                : 'blue'
            }
            onClick={() => !result && handleGuess(option)}
            isDisabled={!!result}
            className={!result ? 'pulse' : ''}
            _hover={{ transform: !result ? 'scale(1.03)' : 'none' }}
            transition="all 0.2s"
            animation={
              selectedOption === option && isAnimating
                ? result?.correct
                  ? `${bounce} 1s`
                  : `${shake} 0.5s`
                : 'none'
            }
          >
            {option}
          </Button>
        ))}
      </SimpleGrid>
      
      {showSadFace && (
        <Box 
          position="fixed" 
          top="50%" 
          left="50%" 
          transform="translate(-50%, -50%)" 
          zIndex={1000}
          fontSize="150px"
          animation={`${shake} 0.5s, ${fadeInOut} 2s`}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Box fontSize="150px" mb={2}>😢</Box>
          <Text fontSize="xl" fontWeight="bold" color="red.500">Incorrect!</Text>
        </Box>
      )}
      
      {result && (
        <ScaleFade initialScale={0.9} in={true}>
          <Alert
            status={result.correct ? 'success' : 'error'}
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            borderRadius="md"
            p={4}
            className="fade-in"
            boxShadow="lg"
            bg={result.correct ? 'green.50' : 'red.50'}
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              {result.correct ? '🎉 Correct!' : '😢 Incorrect!'}
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              {result.correct ? (
                <>
                  <Text mb={2} fontWeight="bold">
                    You guessed correctly! The destination is {result.city}, {result.country}.
                  </Text>
                  <Box 
                    p={3} 
                    bg="green.100" 
                    borderRadius="md" 
                    mt={2}
                    animation={`${bounce} 1s`}
                  >
                    <Text fontWeight="bold">Fun Fact:</Text>
                    <Text>{result.fun_fact}</Text>
                  </Box>
                  {result.trivia && (
                    <Box 
                      p={3} 
                      bg="blue.100" 
                      borderRadius="md" 
                      mt={2}
                    >
                      <Text fontWeight="bold">Trivia:</Text>
                      <Text>{result.trivia}</Text>
                    </Box>
                  )}
                  <Button
                    mt={4}
                    colorScheme="green"
                    onClick={getRandomDestination}
                    size="md"
                    leftIcon={<Box as="span">🎮</Box>}
                    _hover={{ transform: 'scale(1.05)' }}
                    transition="all 0.2s"
                  >
                    Play Again
                  </Button>
                </>
              ) : (
                <>
                  <Text mb={2} fontWeight="bold">
                    Sorry, that's incorrect. The correct answer is {result.city}, {result.country}.
                  </Text>
                  <Box 
                    p={3} 
                    bg="red.100" 
                    borderRadius="md" 
                    mt={2}
                  >
                    <Text fontWeight="bold">Fun Fact:</Text>
                    <Text>{result.fun_fact}</Text>
                  </Box>
                  <Button
                    mt={4}
                    colorScheme="blue"
                    onClick={getRandomDestination}
                    size="md"
                    leftIcon={<Box as="span">🎮</Box>}
                    _hover={{ transform: 'scale(1.05)' }}
                    transition="all 0.2s"
                  >
                    Try Another Destination
                  </Button>
                </>
              )}
            </AlertDescription>
          </Alert>
        </ScaleFade>
      )}
      
      <Box display="flex" justifyContent="space-between" flexDirection={{ base: 'column', md: 'row' }} gap={4}>
        <Button
          colorScheme="brand"
          onClick={getRandomDestination}
          size="lg"
          width={{ base: '100%', md: 'auto' }}
          leftIcon={<Box as="span">🌍</Box>}
          _hover={{ transform: 'scale(1.05)' }}
          transition="all 0.2s"
        >
          Next Destination
        </Button>
        
        {username && (
          <Button
            colorScheme="teal"
            onClick={onOpen}
            size="lg"
            width={{ base: '100%', md: 'auto' }}
            leftIcon={<Box as="span">🏆</Box>}
            _hover={{ transform: 'scale(1.05)' }}
            transition="all 0.2s"
          >
            Challenge a Friend
          </Button>
        )}
      </Box>
      
      <ChallengeModal 
        isOpen={isOpen} 
        onClose={onClose} 
        username={username} 
        score={score}
        totalAttempts={totalAttempts}
      />
    </VStack>
  );
};

export default GameBoard; 