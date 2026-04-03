"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Select,
  Switch,
  Button,
  Group,
  Stack,
  Alert,
  Grid,
  Divider,
  Box,
  Avatar,
  FileInput,
  SimpleGrid,
  Radio,
  Card,
  ThemeIcon,
  Badge,
  Progress,
  Tooltip,
  ActionIcon, // ← THIS WAS MISSING!
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconInfoCircle,
  IconCheck,
  IconX,
  IconUser,
  IconMail,
  IconLock,
  IconBell,
  IconEye,
  IconWorld,
  IconMoon,
  IconSun,
  IconDeviceLaptop,
  IconShield,
  IconShieldLock,
  IconKey,
  IconBellRinging,
  IconPalette,
  IconGlobe,
  IconClock,
  IconCamera,
  IconUpload,
  IconAlertTriangle,
  IconCircleCheck,
  IconCircleX,
  IconHelpCircle,
  IconArrowLeft,
  IconArrowRight,
  IconStar,
  IconHeart,
  IconSettings,
  IconLogout,
} from "@tabler/icons-react";

// Gradient constants - More vibrant
const GRADIENT_PRIMARY = "linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)";
const GRADIENT_SECONDARY = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
const GRADIENT_SUCCESS = "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)";
const GRADIENT_WARNING = "linear-gradient(135deg, #fa709a 0%, #fee140 100%)";
const GRADIENT_INFO = "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)";

export default function UserSettingsPage() {
  const [formData, setFormData] = useState({
    // Profile
    displayName: "",
    email: "",
    avatar: null,
    // Security
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    // Preferences
    language: "en",
    theme: "system",
    timezone: "UTC",
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    // Privacy
    profileVisibility: "public",
    showEmail: false,
    allowDataCollection: true,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [activeTab, setActiveTab] = useState("profile");

  // Password visibility toggles
  const [visibleCurrent, { toggle: toggleCurrent }] = useDisclosure(false);
  const [visibleNew, { toggle: toggleNew }] = useDisclosure(false);
  const [visibleConfirm, { toggle: toggleConfirm }] = useDisclosure(false);

  // Load saved settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("userSettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed, avatar: null }));
      } catch (e) {
        console.error("Failed to parse saved settings");
      }
    }
  }, []);

  // Track unsaved changes
  useEffect(() => {
    const saved = localStorage.getItem("userSettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const { avatar: savedAvatar, ...savedRest } = parsed;
        const { avatar: currentAvatar, ...currentRest } = formData;
        setHasUnsavedChanges(JSON.stringify(savedRest) !== JSON.stringify(currentRest));
      } catch (e) {
        setHasUnsavedChanges(true);
      }
    } else {
      const defaultData = {
        displayName: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        language: "en",
        theme: "system",
        timezone: "UTC",
        emailNotifications: true,
        pushNotifications: false,
        marketingEmails: false,
        profileVisibility: "public",
        showEmail: false,
        allowDataCollection: true,
      };
      const { avatar, ...currentRest } = formData;
      setHasUnsavedChanges(JSON.stringify(currentRest) !== JSON.stringify(defaultData));
    }
  }, [formData]);

  // Calculate password strength
  useEffect(() => {
    if (!formData.newPassword) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    const password = formData.newPassword;

    // Length check
    if (password.length >= 8) strength += 25;
    else if (password.length >= 6) strength += 15;

    // Contains number
    if (/\d/.test(password)) strength += 25;

    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 25;

    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 25;

    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;

    setPasswordStrength(Math.min(strength, 100));
  }, [formData.newPassword]);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = "Display name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Current password is required to change password";
      }
      if (!formData.newPassword) {
        newErrors.newPassword = "New password is required";
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters";
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setNotification({ type: "error", message: "Please fix the errors above" });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const { avatar, ...dataToSave } = formData;
      localStorage.setItem("userSettings", JSON.stringify(dataToSave));

      setNotification({ type: "success", message: "Settings saved successfully!" });
      setHasUnsavedChanges(false);
    } catch (error) {
      setNotification({ type: "error", message: "Failed to save. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return "red";
    if (passwordStrength < 60) return "orange";
    if (passwordStrength < 80) return "yellow";
    return "green";
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 30) return "Weak";
    if (passwordStrength < 60) return "Fair";
    if (passwordStrength < 80) return "Good";
    return "Strong";
  };

  // Language options
  const languages = [
    { value: "en", label: "🇬🇧 English" },
    { value: "es", label: "🇪🇸 Spanish" },
    { value: "fr", label: "🇫🇷 French" },
    { value: "de", label: "🇩🇪 German" },
    { value: "zh", label: "🇨🇳 Chinese" },
  ];

  // Timezone options
  const timezones = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Asia/Shanghai",
  ];

  // Navigation tabs
  const tabs = [
    { id: "profile", label: "Profile", icon: IconUser },
    { id: "security", label: "Security", icon: IconShieldLock },
    { id: "preferences", label: "Preferences", icon: IconPalette },
    { id: "notifications", label: "Notifications", icon: IconBellRinging },
    { id: "privacy", label: "Privacy", icon: IconShield },
  ];

  return (
    <Box style={{ minHeight: "100vh", background: "#f8faff" }}>
      {/* Header with animated gradient */}
      <Box
        style={{
          background: GRADIENT_PRIMARY,
          padding: "3rem 0",
          marginBottom: "2rem",
          boxShadow: "0 15px 35px rgba(65, 88, 208, 0.3)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated background elements */}
        <Box
          style={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            animation: "pulse 3s infinite",
          }}
        />
        <Box
          style={{
            position: "absolute",
            bottom: -80,
            left: -30,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            animation: "pulse 4s infinite",
          }}
        />

        <Container size="xl">
          <Group justify="space-between" align="center">
            <Group gap="md">
              <ActionIcon
                size="lg"
                variant="filled"
                radius="xl"
                style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}
                onClick={() => window.history.back()}
              >
                <IconArrowLeft size={20} color="white" />
              </ActionIcon>
              <div>
                <Title order={1} c="white" style={{ fontSize: "2.5rem", textShadow: "2px 2px 4px rgba(0,0,0,0.2)" }}>
                  Profile Settings
                </Title>
                <Text c="white" size="lg" opacity={0.9}>Customize your account experience</Text>
              </div>
            </Group>
            <Badge
              size="xl"
              variant="filled"
              style={{
                background: hasUnsavedChanges ? "rgba(255, 255, 255, 0.2)" : "rgba(74, 222, 128, 0.3)",
                backdropFilter: "blur(10px)",
                padding: "12px 24px",
                borderRadius: "30px",
                fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              {hasUnsavedChanges ? (
                <Group gap="xs">
                  <IconAlertTriangle size={18} />
                  <span>Unsaved Changes</span>
                </Group>
              ) : (
                <Group gap="xs">
                  <IconCircleCheck size={18} />
                  <span>All Saved</span>
                </Group>
              )}
            </Badge>
          </Group>

          {/* Quick stats */}
          <Group gap="xl" mt="xl">
            <Box>
              <Text size="sm" c="white" opacity={0.8}>Member since</Text>
              <Text fw={700} c="white">March 2024</Text>
            </Box>
            <Box>
              <Text size="sm" c="white" opacity={0.8}>Reports filed</Text>
              <Text fw={700} c="white">12 cases</Text>
            </Box>
            <Box>
              <Text size="sm" c="white" opacity={0.8}>Found items</Text>
              <Text fw={700} c="white">8 items</Text>
            </Box>
          </Group>
        </Container>
      </Box>

      <Container size="xl" pb="xl">
        {/* Notification */}
        {notification && (
          <Alert
            mb="md"
            variant="filled"
            color={notification.type === "success" ? "green" : "red"}
            title={notification.type === "success" ? "Success!" : "Error!"}
            icon={notification.type === "success" ? <IconCircleCheck size={20} /> : <IconCircleX size={20} />}
            withCloseButton
            onClose={() => setNotification(null)}
            style={{
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {notification.message}
          </Alert>
        )}

        {/* Tab Navigation */}
        <Paper withBorder radius="lg" mb="xl" p="xs" style={{ border: "1px solid rgba(65, 88, 208, 0.1)" }}>
          <Group justify="center" gap="xs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "gradient" : "subtle"}
                  gradient={isActive ? { from: '#4158D0', to: '#C850C0', deg: 135 } : undefined}
                  leftSection={<Icon size={18} />}
                  onClick={() => setActiveTab(tab.id)}
                  radius="xl"
                  size="md"
                  style={{
                    flex: 1,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {tab.label}
                </Button>
              );
            })}
          </Group>
        </Paper>

        {/* Main Form */}
        <Paper
          withBorder
          shadow="xl"
          p="xl"
          radius="lg"
          style={{
            background: "white",
            border: "1px solid rgba(65, 88, 208, 0.1)",
            boxShadow: "0 20px 40px rgba(65, 88, 208, 0.08)",
          }}
        >
          <form onSubmit={handleSubmit}>
            <Stack gap="xl">
              {/* Profile Section */}
              <Card
                withBorder
                radius="lg"
                p="xl"
                style={{
                  border: "1px solid rgba(65, 88, 208, 0.1)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
                  display: activeTab === "profile" ? "block" : "none",
                }}
              >
                <Group gap="sm" mb="lg">
                  <ThemeIcon size={50} radius="lg" style={{ background: GRADIENT_PRIMARY }}>
                    <IconUser size={24} color="white" />
                  </ThemeIcon>
                  <div>
                    <Title order={3} style={{ background: GRADIENT_PRIMARY, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      Profile Information
                    </Title>
                    <Text size="sm" c="dimmed">Update your personal details and profile picture</Text>
                  </div>
                </Group>

                <Grid gutter="xl">
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Stack align="center" gap="md">
                      <Box style={{ position: 'relative' }}>
                        <Avatar
                          size={180}
                          radius={180}
                          src={formData.avatar ? URL.createObjectURL(formData.avatar) : null}
                          color="blue"
                          style={{
                            border: '4px solid white',
                            boxShadow: '0 15px 30px rgba(65, 88, 208, 0.2)',
                          }}
                        >
                          {!formData.avatar && formData.displayName ? (
                            <span style={{ fontSize: '4rem' }}>{formData.displayName.charAt(0).toUpperCase()}</span>
                          ) : (
                            <IconUser size={80} />
                          )}
                        </Avatar>
                        <Tooltip label="Change photo" position="bottom" withArrow>
                          <ActionIcon
                            component="label"
                            size="lg"
                            style={{
                              position: 'absolute',
                              bottom: 10,
                              right: 10,
                              background: GRADIENT_PRIMARY,
                              border: '3px solid white',
                              cursor: 'pointer',
                              boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                            }}
                          >
                            <IconCamera size={20} color="white" />
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => handleChange("avatar", e.target.files?.[0])}
                            />
                          </ActionIcon>
                        </Tooltip>
                      </Box>
                      <Text size="sm" c="dimmed">Click camera icon to update</Text>
                      <Badge color="blue" variant="light" size="lg">Active Account</Badge>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 8 }}>
                    <Stack gap="md">
                      <TextInput
                        label={<Text fw={600}>Display name</Text>}
                        placeholder="Enter your name"
                        value={formData.displayName}
                        onChange={(e) => handleChange("displayName", e.target.value)}
                        error={errors.displayName}
                        required
                        leftSection={<IconUser size={16} />}
                        size="md"
                        radius="md"
                        styles={{
                          input: {
                            '&:focus': {
                              borderColor: '#4158D0',
                              boxShadow: '0 0 0 3px rgba(65, 88, 208, 0.1)',
                            },
                          },
                        }}
                      />
                      <TextInput
                        label={<Text fw={600}>Email address</Text>}
                        placeholder="you@example.com"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        error={errors.email}
                        required
                        leftSection={<IconMail size={16} />}
                        size="md"
                        radius="md"
                      />
                      <Divider label="Account Verification" labelPosition="center" />
                      <Group>
                        <Badge color="green" variant="light" leftSection={<IconCheck size={12} />}>Email Verified</Badge>
                        <Badge color="yellow" variant="light" leftSection={<IconAlertTriangle size={12} />}>Phone Pending</Badge>
                      </Group>
                    </Stack>
                  </Grid.Col>
                </Grid>
              </Card>

              {/* Security Section */}
              <Card
                withBorder
                radius="lg"
                p="xl"
                style={{
                  border: "1px solid rgba(65, 88, 208, 0.1)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
                  display: activeTab === "security" ? "block" : "none",
                }}
              >
                <Group gap="sm" mb="lg">
                  <ThemeIcon size={50} radius="lg" style={{ background: GRADIENT_WARNING }}>
                    <IconShieldLock size={24} color="white" />
                  </ThemeIcon>
                  <div>
                    <Title order={3} style={{ background: GRADIENT_WARNING, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      Security Settings
                    </Title>
                    <Text size="sm" c="dimmed">Manage your password and account security</Text>
                  </div>
                </Group>

                <Alert
                  icon={<IconInfoCircle size={16} />}
                  title="Security Tip"
                  color="blue"
                  radius="md"
                  mb="lg"
                  variant="light"
                >
                  Use a strong password with at least 8 characters, including numbers and special characters.
                </Alert>

                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <PasswordInput
                      label="Current password"
                      placeholder="••••••••"
                      value={formData.currentPassword}
                      onChange={(e) => handleChange("currentPassword", e.target.value)}
                      error={errors.currentPassword}
                      visible={visibleCurrent}
                      onVisibilityChange={toggleCurrent}
                      leftSection={<IconKey size={16} />}
                      size="md"
                      radius="md"
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <PasswordInput
                      label="New password"
                      placeholder="••••••••"
                      value={formData.newPassword}
                      onChange={(e) => handleChange("newPassword", e.target.value)}
                      error={errors.newPassword}
                      visible={visibleNew}
                      onVisibilityChange={toggleNew}
                      size="md"
                      radius="md"
                    />
                    {formData.newPassword && (
                      <Box mt="xs">
                        <Group justify="space-between" mb={5}>
                          <Text size="xs" c="dimmed">Password strength</Text>
                          <Text size="xs" fw={600} c={getPasswordStrengthColor()}>
                            {getPasswordStrengthLabel()}
                          </Text>
                        </Group>
                        <Progress
                          value={passwordStrength}
                          color={getPasswordStrengthColor()}
                          size="sm"
                          radius="xl"
                          striped
                          animated
                        />
                      </Box>
                    )}
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <PasswordInput
                      label="Confirm new password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      error={errors.confirmPassword}
                      visible={visibleConfirm}
                      onVisibilityChange={toggleConfirm}
                      size="md"
                      radius="md"
                    />
                  </Grid.Col>
                </Grid>
              </Card>

              {/* Preferences Section */}
              <Card
                withBorder
                radius="lg"
                p="xl"
                style={{
                  border: "1px solid rgba(65, 88, 208, 0.1)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
                  display: activeTab === "preferences" ? "block" : "none",
                }}
              >
                <Group gap="sm" mb="lg">
                  <ThemeIcon size={50} radius="lg" style={{ background: GRADIENT_INFO }}>
                    <IconPalette size={24} color="white" />
                  </ThemeIcon>
                  <div>
                    <Title order={3} style={{ background: GRADIENT_INFO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      Preferences
                    </Title>
                    <Text size="sm" c="dimmed">Customize your experience</Text>
                  </div>
                </Group>

                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Select
                      label="Language"
                      placeholder="Select language"
                      data={languages}
                      value={formData.language}
                      onChange={(value) => handleChange("language", value)}
                      leftSection={<IconGlobe size={16} />}
                      size="md"
                      radius="md"
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Select
                      label="Timezone"
                      placeholder="Select timezone"
                      data={timezones}
                      value={formData.timezone}
                      onChange={(value) => handleChange("timezone", value)}
                      leftSection={<IconClock size={16} />}
                      searchable
                      size="md"
                      radius="md"
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Radio.Group
                      label="Theme"
                      value={formData.theme}
                      onChange={(value) => handleChange("theme", value)}
                    >
                      <Group mt="xs">
                        <Radio
                          value="light"
                          label="Light"
                          icon={IconSun}
                          styles={{ radio: { borderColor: '#4158D0' } }}
                        />
                        <Radio
                          value="dark"
                          label="Dark"
                          icon={IconMoon}
                          styles={{ radio: { borderColor: '#4158D0' } }}
                        />
                        <Radio
                          value="system"
                          label="System"
                          icon={IconDeviceLaptop}
                          styles={{ radio: { borderColor: '#4158D0' } }}
                        />
                      </Group>
                    </Radio.Group>
                  </Grid.Col>
                </Grid>
              </Card>

              {/* Notifications Section */}
              <Card
                withBorder
                radius="lg"
                p="xl"
                style={{
                  border: "1px solid rgba(65, 88, 208, 0.1)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
                  display: activeTab === "notifications" ? "block" : "none",
                }}
              >
                <Group gap="sm" mb="lg">
                  <ThemeIcon size={50} radius="lg" style={{ background: GRADIENT_SUCCESS }}>
                    <IconBellRinging size={24} color="white" />
                  </ThemeIcon>
                  <div>
                    <Title order={3} style={{ background: GRADIENT_SUCCESS, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      Notifications
                    </Title>
                    <Text size="sm" c="dimmed">Choose how we contact you</Text>
                  </div>
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                  <Switch
                    label="Email notifications"
                    description="Receive updates via email"
                    checked={formData.emailNotifications}
                    onChange={(e) => handleChange("emailNotifications", e.currentTarget.checked)}
                    size="lg"
                    styles={{
                      track: {
                        backgroundColor: formData.emailNotifications ? '#4158D0' : undefined,
                      },
                    }}
                  />
                  <Switch
                    label="Push notifications"
                    description="Receive browser push notifications"
                    checked={formData.pushNotifications}
                    onChange={(e) => handleChange("pushNotifications", e.currentTarget.checked)}
                    size="lg"
                  />
                  <Switch
                    label="Marketing emails"
                    description="Receive newsletters and promotions"
                    checked={formData.marketingEmails}
                    onChange={(e) => handleChange("marketingEmails", e.currentTarget.checked)}
                    size="lg"
                  />
                  <Switch
                    label="SMS alerts"
                    description="Get text messages for urgent updates"
                    checked={false}
                    onChange={() => {}}
                    size="lg"
                  />
                </SimpleGrid>
              </Card>

              {/* Privacy Section */}
              <Card
                withBorder
                radius="lg"
                p="xl"
                style={{
                  border: "1px solid rgba(65, 88, 208, 0.1)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
                  display: activeTab === "privacy" ? "block" : "none",
                }}
              >
                <Group gap="sm" mb="lg">
                  <ThemeIcon size={50} radius="lg" style={{ background: GRADIENT_SECONDARY }}>
                    <IconShield size={24} color="white" />
                  </ThemeIcon>
                  <div>
                    <Title order={3} style={{ background: GRADIENT_SECONDARY, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      Privacy
                    </Title>
                    <Text size="sm" c="dimmed">Control your data visibility</Text>
                  </div>
                </Group>

                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Select
                      label="Profile visibility"
                      data={[
                        { value: "public", label: "🌍 Public - Anyone can see" },
                        { value: "private", label: "🔒 Private - Only you" },
                        { value: "friends", label: "👥 Friends only" },
                      ]}
                      value={formData.profileVisibility}
                      onChange={(value) => handleChange("profileVisibility", value)}
                      leftSection={<IconEye size={16} />}
                      size="md"
                      radius="md"
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Switch
                      label="Show email on profile"
                      description="Display your email address publicly"
                      checked={formData.showEmail}
                      onChange={(e) => handleChange("showEmail", e.currentTarget.checked)}
                      mt="md"
                    />
                    <Switch
                      label="Allow data collection"
                      description="Help us improve by sharing anonymous usage data"
                      checked={formData.allowDataCollection}
                      onChange={(e) => handleChange("allowDataCollection", e.currentTarget.checked)}
                      mt="md"
                    />
                  </Grid.Col>
                </Grid>
              </Card>

              {/* Form Actions */}
              <Group justify="space-between" mt="lg" pt="lg" style={{ borderTop: '1px solid #e9ecef' }}>
                <Button
                  variant="light"
                  color="gray"
                  component={Link}
                  href="/dashboard"
                  size="lg"
                  radius="md"
                  leftSection={<IconX size={20} />}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={isLoading || !hasUnsavedChanges}
                  size="lg"
                  radius="md"
                  leftSection={<IconCheck size={20} />}
                  style={{
                    background: GRADIENT_PRIMARY,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 10px 25px rgba(65, 88, 208, 0.4)',
                    },
                  }}
                >
                  {isLoading ? "Saving..." : "Save changes"}
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>

        {/* Info Card */}
        <Alert
          mt="xl"
          variant="light"
          color="blue"
          icon={<IconInfoCircle size={20} />}
          title="🔒 About your data"
          radius="lg"
          styles={{
            root: {
              border: '1px solid rgba(65, 88, 208, 0.2)',
              background: 'linear-gradient(135deg, rgba(65, 88, 208, 0.05) 0%, rgba(200, 80, 192, 0.05) 100%)',
            },
          }}
        >
          <Text size="sm">Your settings are stored locally in this demo. In a real app, they would be saved to our servers securely with end-to-end encryption.</Text>
        </Alert>
      </Container>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.4; }
          100% { transform: scale(1); opacity: 0.3; }
        }
      `}</style>
    </Box>
  );
}