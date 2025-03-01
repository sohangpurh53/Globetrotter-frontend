import { useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Heading,
  useToast,
  FormErrorMessage,
  Text,
  Image,
  Badge,
} from '@chakra-ui/react';
import { loginOrCreateUser } from '../utils/api';

const UserForm = ({ onUserRegistered, inviterInfo }) => {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const { profile, isNewUser } = await loginOrCreateUser(username);
      
      toast({
        title: isNewUser ? 'Account Created!' : 'Welcome Back!',
        description: isNewUser 
          ? `Welcome, ${username}! Your account has been created.` 
          : `Welcome back, ${username}! Your score: ${profile.score}/${profile.total_attempts || 0}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onUserRegistered(username, profile.score || 0, profile.total_attempts || 0);
    } catch (error) {
      let errorMessage = 'Failed to register. Please try again.';
      
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'object' && error.response.data.username) {
          // Django typically returns field errors in this format
          errorMessage = error.response.data.username[0];
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      }
      
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={6} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="white" className="fade-in">
      <VStack spacing={6}>
        <Image 
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1035&q=80" 
          alt="Travel" 
          borderRadius="md" 
          maxH="150px" 
          objectFit="cover"
        />
        
        <Heading as="h1" size="xl" color="brand.700">
          Globetrotter Challenge
        </Heading>
        
        <Text>Test your knowledge of world destinations!</Text>
        
        {inviterInfo && (
          <Box 
            p={3} 
            bg="blue.50" 
            borderRadius="md" 
            width="100%" 
            textAlign="center"
            className="jello"
          >
            <Text fontWeight="bold">
              <Badge colorScheme="blue" fontSize="0.8em" mr={1}>
                CHALLENGE
              </Badge>
              Beat {inviterInfo.username}'s score: {inviterInfo.score}/{inviterInfo.totalAttempts}
            </Text>
          </Box>
        )}
        
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4} align="flex-start">
            <FormControl isInvalid={!!error}>
              <FormLabel htmlFor="username">Enter your username</FormLabel>
              <Input
                id="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {error && <FormErrorMessage>{error}</FormErrorMessage>}
              <Text fontSize="sm" color="gray.500" mt={1}>
                New users will be registered. Existing users will be logged in.
              </Text>
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="brand"
              isLoading={isSubmitting}
              loadingText="Submitting"
              width="full"
            >
              Start Playing
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default UserForm; 