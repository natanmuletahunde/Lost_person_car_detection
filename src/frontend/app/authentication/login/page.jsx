'use client';

import {
  Container,
  Paper,
  TextInput,
  Button,
  Title,
  Text,
  Divider,
  Box,
  rem,
  PasswordInput,
  Alert,
  useMantineTheme,
  useMantineColorScheme,
} from '@mantine/core';
import { IconCheck, IconX, IconAlertCircle } from '@tabler/icons-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SocialLoginIcons from '../../components/SocialLoginIcons';

// Helper to get dynamic background/color values
const getBg = (colorScheme, light, dark) => (colorScheme === 'dark' ? dark : light);

/* ---------------- Validation schemas ---------------- */
// Password login schema
const passwordLoginSchema = z.object({
  loginValue: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

// Phone login schema
const phoneLoginSchema = z.object({
  loginValue: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number cannot exceed 15 digits')
    .regex(/^[\d\s\+\-]+$/, 'Invalid phone number'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const [type, setType] = useState('email'); // 'email' or 'phone'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [userExists, setUserExists] = useState(null);
  const router = useRouter();
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  const isMobile = useMediaQuery('(max-width: 576px)');
  const isTablet = useMediaQuery('(max-width: 768px)');

  // Dynamic colors
  const mainBg = getBg(colorScheme, '#EAF2FF', theme.colors.dark[7]);
  const paperBg = getBg(colorScheme, '#dbeafe', theme.colors.blue[9]);
  const textColor = getBg(colorScheme, undefined, theme.colors.gray[3]); // use default in light, gray[3] in dark

  const currentSchema = type === 'email' ? passwordLoginSchema : phoneLoginSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    trigger,
    setValue,
    watch,
    setError,
    clearErrors,
  } = useForm({
    resolver: zodResolver(currentSchema),
    mode: 'onChange',
    defaultValues: { 
      loginValue: '', 
      password: '' 
    },
  });

  const watchedValue = watch('loginValue');
  const watchedPassword = watch('password');

  // Check if user exists when login value changes (with debounce)
  useEffect(() => {
    const checkUserExists = async () => {
      if (!watchedValue || watchedValue.length < 3) {
        setUserExists(null);
        return;
      }

      setIsCheckingUser(true);
      setLoginError('');
      
      try {
        let queryField = type === 'email' ? 'email' : 'phone';
        const response = await fetch(
          `http://localhost:3001/users?${queryField}=${encodeURIComponent(watchedValue)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const users = await response.json();
          setUserExists(users.length > 0);
          
          if (users.length === 0) {
            setLoginError(`No account found with this ${type === 'email' ? 'email' : 'phone number'}`);
          } else {
            clearErrors('loginValue');
          }
        }
      } catch (error) {
        console.error('Error checking user:', error);
        setUserExists(null);
      } finally {
        setIsCheckingUser(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(() => {
      checkUserExists();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedValue, type, clearErrors]);

  const showNotification = (title, message, color, icon) => {
    notifications.show({
      title,
      message,
      color,
      icon,
      position: 'top-right',
      autoClose: 3000,
      withBorder: true,
    });
  };

  const handleTypeSwitch = () => {
    const newType = type === 'email' ? 'phone' : 'email';
    setType(newType);
    setValue('loginValue', '');
    setValue('password', '');
    setUserExists(null);
    setLoginError('');
    reset();
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setLoginError('');

    try {
      // Determine which field to query by
      const queryField = type === 'email' ? 'email' : 'phone';
      
      // Check if user exists with the provided credentials
      const response = await fetch(
        `http://localhost:3001/users?${queryField}=${encodeURIComponent(data.loginValue)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to connect to server');
      }

      const users = await response.json();

      if (users.length === 0) {
        setLoginError(`No account found with this ${type === 'email' ? 'email' : 'phone number'}`);
        showNotification(
          'Account Not Found',
          `Please check your ${type === 'email' ? 'email' : 'phone number'} or sign up for a new account.`,
          'red',
          <IconX size={18} />
        );
        setIsSubmitting(false);
        return;
      }

      const user = users[0];

      // In a real app, you would compare hashed passwords
      // For demo purposes, we're comparing plain text (not secure for production)
      if (user.password === data.password) {
        // Login successful
        showNotification(
          'Login Successful!',
          `Welcome back, ${user.firstName}!`,
          'green',
          <IconCheck size={18} />
        );
        
        // Store user data in localStorage (for demo only - use proper auth in production)
        localStorage.setItem('currentUser', JSON.stringify({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
        }));

        localStorage.setItem('isAuthenticated', 'true');
        
        // Update last login time in the database
        await fetch(`http://localhost:3001/users/${user.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lastLogin: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        });

        // Redirect based on user role
        setTimeout(() => {
          // Check if the user has an admin role (case-insensitive)
          if (user.role && user.role.toLowerCase() === 'admin') {
            router.push('/admin'); // redirect to admin dashboard
          } else {
            router.push('/'); // redirect to user dashboard (current home page)
          }
        }, 1000);
        
      } else {
        // Password doesn't match
        setLoginError('Invalid password. Please try again.');
        showNotification(
          'Login Failed',
          'The password you entered is incorrect.',
          'red',
          <IconX size={18} />
        );
      }

    } catch (error) {
      console.error('Login error:', error);
      setLoginError('An error occurred. Please try again.');
      showNotification(
        'Error',
        'Failed to connect to server. Please check your connection.',
        'red',
        <IconX size={18} />
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!watchedValue || errors.loginValue) {
      showNotification(
        'Error',
        'Please enter a valid email or phone number first.',
        'red',
        <IconX size={18} />
      );
      return;
    }

    showNotification(
      'Password Reset',
      `Password reset instructions have been sent to your ${type === 'email' ? 'email' : 'phone'}.`,
      'blue',
      <IconCheck size={18} />
    );
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: mainBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: rem(16),
      }}
    >
      <Container size={isMobile ? 'sm' : isTablet ? 500 : 500}>
        <Paper radius="lg" p={isMobile ? 'md' : 'xl'} shadow="md" bg={paperBg}>
          <Box ta="center" mb="sm">
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={isMobile ? 80 : 100}
              height={isMobile ? 60 : 75}
              style={{ objectFit: 'contain', borderRadius: 8 }}
              priority
            />
          </Box>

          <Title ta="center" fw={700} c={textColor}>
            WELCOME !!
          </Title>

          <Title ta="center" order={4} mb="md" c={textColor}>
            Login
          </Title>

          <Text ta="center" mb="sm" c="dimmed">
            {type === 'email'
              ? 'Please enter your email and password'
              : 'Please enter your phone number and password'}
          </Text>

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextInput
              label={type === 'email' ? 'Email' : 'Phone number'}
              placeholder={
                type === 'email'
                  ? 'example@email.com'
                  : '+251 9xx xxx xxx'
              }
              {...register('loginValue')}
              error={errors.loginValue?.message}
              onBlur={() => trigger('loginValue')}
              disabled={isSubmitting}
              rightSection={
                isCheckingUser ? (
                  <Text size="xs" c="blue">
                    Checking...
                  </Text>
                ) : userExists === true ? (
                  <IconCheck size={16} color="green" />
                ) : userExists === false ? (
                  <IconX size={16} color="red" />
                ) : null
              }
            />

            <PasswordInput
              mt="md"
              label="Password"
              placeholder="Enter your password"
              {...register('password')}
              error={errors.password?.message}
              onBlur={() => trigger('password')}
              disabled={isSubmitting}
            />

            {loginError && (
              <Alert
                mt="md"
                icon={<IconAlertCircle size={16} />}
                color="red"
                variant="light"
                title="Login Error"
                withCloseButton
                onClose={() => setLoginError('')}
              >
                {loginError}
              </Alert>
            )}

            <Button
              fullWidth
              mt="md"
              type="submit"
              loading={isSubmitting}
              disabled={!isValid || isSubmitting || userExists === false}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <Box mt="sm" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text 
              c="blue" 
              onClick={handleTypeSwitch} 
              style={{ cursor: 'pointer' }}
              size="sm"
            >
              {type === 'email'
                ? 'Login using phone number'
                : 'Login using email'}
            </Text>
            
            <Text 
              c="blue" 
              onClick={handleForgotPassword} 
              style={{ cursor: 'pointer' }}
              size="sm"
            >
              Forgot password?
            </Text>
          </Box>

          <Text ta="center" mt="xs" c="dimmed">
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: '#228be6', textDecoration: 'none' }}>
              Sign up
            </Link>
          </Text>

          <Divider my="md" label="or sign in using" labelPosition="center" />

          <SocialLoginIcons isMobile={isMobile} />

          {/* Demo credentials alert */}
          <Alert
            mt="lg"
            icon={<IconAlertCircle size={16} />}
            color="gray"
            variant="outline"
            title="Demo Credentials"
            size="sm"
          >
            <Text size="xs">
              Try: john@example.com / SecurePass123!
            </Text>
          </Alert>
        </Paper>
      </Container>
    </Box>
  );
}