"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Title,
  Text,
  Button,
  TextInput,
  Avatar,
  Paper,
  Stack,
  Divider,
  ActionIcon,
  Flex,
  UnstyledButton,
  Group,
  Switch,
  Modal,
  PasswordInput,
  Select,
  Table,
  Badge,
  useMantineColorScheme,
  useMantineTheme,
  Skeleton,
  Transition,
  Tooltip,
  Affix,
  PinInput,
  Collapse,
  Card,
  Alert,
  Progress,
  ThemeIcon,
  SimpleGrid,
  Radio,
  Checkbox,
  Slider,
  Kbd,
  Chip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconUser,
  IconBell,
  IconShield,
  IconHistory,
  IconSettings,
  IconLogout,
  IconCamera,
  IconChevronRight,
  IconArrowLeft,
  IconWorld,
  IconLock,
  IconCheck,
  IconX,
  IconDeviceFloppy,
  IconMail,
  IconPhone,
  IconMapPin,
  IconKey,
  IconShieldLock,
  IconBellRinging,
  IconPalette,
  IconMoon,
  IconSun,
  IconInfoCircle,
  IconCircleCheck,
  IconAlertTriangle,
  IconFingerprint,
  IconClock,
  IconCreditCard,
  IconLanguage,
  IconAccessible,
  IconRefresh,
  IconDeviceLaptop,
  IconAddressBook,
  IconPassword,
  IconCreditCard as IconPayment,
  IconBrush,
  IconSearch,
  IconDownload,
  IconStar,
  IconGauge,
  IconCookie,
  IconTrash,
  IconEdit,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Helper to get dynamic background colors
const getBg = (colorScheme, light, dark) =>
  colorScheme === "dark" ? dark : light;
const getTextColor = (colorScheme, light, dark) =>
  colorScheme === "dark" ? dark : light;
const getBorderColor = (colorScheme) =>
  colorScheme === "dark" ? "#2c2e33" : "#eaeef2";

// Zod schema for change password
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase")
      .regex(/[a-z]/, "Must contain lowercase")
      .regex(/\d/, "Must contain number")
      .regex(/[!@#$%^&*]/, "Must contain special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Simple hash function for demo
const simpleHash = async (str) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const theme = useMantineTheme();
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const [activeTab, setActiveTab] = useState("account");
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [originalUser, setOriginalUser] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [userId, setUserId] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [fontSize, setFontSize] = useState(16);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorPinHash, setTwoFactorPinHash] = useState(null);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [setupMode, setSetupMode] = useState("setup");
  const [pinValue, setPinValue] = useState("");
  const [confirmPinValue, setConfirmPinValue] = useState("");
  const [pinError, setPinError] = useState("");

  const [pwdOpened, { open: openPwd, close: closePwd }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [resetOpened, { open: openReset, close: closeReset }] =
    useDisclosure(false);

  // Form for change password
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Navigation items (Chrome-style)
  const navGroups = [
    {
      title: "You and your account",
      items: [{ id: "account", label: "Your account", icon: IconUser }],
    },
    {
      title: "Autofill and data",
      items: [
        { id: "autofill", label: "Autofill and passwords", icon: IconPassword },
        { id: "payment-methods", label: "Payment methods", icon: IconPayment },
        { id: "addresses", label: "Addresses and more", icon: IconAddressBook },
      ],
    },
    {
      title: "Privacy and security",
      items: [
        { id: "privacy", label: "Privacy and security", icon: IconShield },
        { id: "security", label: "Security", icon: IconShieldLock },
      ],
    },
    {
      title: "Appearance",
      items: [
        { id: "appearance", label: "Appearance", icon: IconBrush },
        { id: "languages", label: "Languages", icon: IconLanguage },
      ],
    },
    {
      title: "Notifications",
      items: [
        { id: "notifications", label: "Notifications", icon: IconBellRinging },
        { id: "alert-history", label: "Alert history", icon: IconClock },
      ],
    },
    {
      title: "System and advanced",
      items: [
        { id: "performance", label: "Performance", icon: IconGauge },
        { id: "downloads", label: "Downloads", icon: IconDownload },
        { id: "accessibility", label: "Accessibility", icon: IconAccessible },
        { id: "system", label: "System", icon: IconDeviceLaptop },
        {
          id: "reset",
          label: "Reset settings",
          icon: IconRefresh,
          danger: true,
        },
      ],
    },
  ];

  // Flatten for active tab checking
  const allNavItems = navGroups.flatMap((group) => group.items);

  // Load 2FA state
  useEffect(() => {
    const load2FA = async () => {
      const enabled = localStorage.getItem("twoFactorEnabled") === "true";
      const pinHash = localStorage.getItem("twoFactorPinHash");
      setTwoFactorEnabled(enabled);
      setTwoFactorPinHash(pinHash);
    };
    load2FA();
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn");
    router.push("/");
  };

  // Handle image change
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      setDirty(true);
    }
  };

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem("currentUser");
        if (!userData) {
          router.push("/");
          return;
        }

        const parsedUser = JSON.parse(userData);
        setUserId(parsedUser.id);

        const userObj = {
          firstName: parsedUser.firstName || "",
          lastName: parsedUser.lastName || "",
          email: parsedUser.email || "",
          phone: parsedUser.phone || "",
          address: parsedUser.address || "",
        };
        setUser(userObj);
        setOriginalUser(userObj);

        setAlerts([
          {
            id: 1,
            type: "Person",
            time: "Feb 5, 2026 · 8:30 AM",
            location: "Front Gate",
            status: "Reviewed",
          },
          {
            id: 2,
            type: "Vehicle",
            time: "Feb 5, 2026 · 9:15 AM",
            location: "Driveway",
            status: "New",
          },
          {
            id: 3,
            type: "Person",
            time: "Feb 4, 2026 · 11:00 PM",
            location: "Backyard",
            status: "Reviewed",
          },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  // Track dirty state
  useEffect(() => {
    setDirty(
      JSON.stringify(user) !== JSON.stringify(originalUser) || !!profileImage,
    );
  }, [user, originalUser, profileImage]);

  // Calculate password strength
  useEffect(() => {
    const password = passwordForm.watch("newPassword");
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    if (/[!@#$%^&*]/.test(password)) strength += 25;

    setPasswordStrength(Math.min(strength, 100));
  }, [passwordForm.watch("newPassword")]);

  const handleSaveChanges = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      //  This actually updates JSON Server
      const response = await fetch(`http://localhost:3001/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const updatedUser = await response.json();
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      setOriginalUser(user);
      setDirty(false);

      notifications.show({
        title: "Success",
        message: "Profile updated successfully",
        color: "green",
        icon: <IconCheck size={18} />,
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to update profile",
        color: "red",
        icon: <IconX size={18} />,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = async (data) => {
    notifications.show({
      title: "Password Updated",
      message: "Your password has been changed successfully",
      color: "green",
      icon: <IconCheck size={18} />,
    });
    closePwd();
    passwordForm.reset();
  };

  // 2FA handlers
  const handleTwoFactorToggle = (checked) => {
    if (checked && !twoFactorEnabled) {
      setSetupMode("setup");
      setShow2FASetup(true);
    } else if (!checked && twoFactorEnabled) {
      setSetupMode("disable");
      setShow2FASetup(true);
    }
  };

  const handleEnable2FA = async () => {
    if (pinValue.length !== 6 || !/^\d+$/.test(pinValue)) {
      setPinError("PIN must be 6 digits");
      return;
    }
    if (pinValue !== confirmPinValue) {
      setPinError("PINs do not match");
      return;
    }
    const hash = await simpleHash(pinValue);
    localStorage.setItem("twoFactorEnabled", "true");
    localStorage.setItem("twoFactorPinHash", hash);
    setTwoFactorEnabled(true);
    setTwoFactorPinHash(hash);
    setShow2FASetup(false);
    setPinValue("");
    setConfirmPinValue("");
    setPinError("");
    notifications.show({
      title: "2FA Enabled",
      message: "Two-factor authentication has been enabled.",
      color: "green",
    });
  };

  const handleDisable2FA = () => {
    localStorage.removeItem("twoFactorEnabled");
    localStorage.removeItem("twoFactorPinHash");
    setTwoFactorEnabled(false);
    setTwoFactorPinHash(null);
    setShow2FASetup(false);
    notifications.show({
      title: "2FA Disabled",
      message: "Two-factor authentication has been disabled.",
      color: "blue",
    });
  };

  const cancel2FASetup = () => {
    setShow2FASetup(false);
    setPinValue("");
    setConfirmPinValue("");
    setPinError("");
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

  if (loading) {
    return (
      <Box
        bg={getBg(colorScheme, "#fff", "#1a1b1e")}
        style={{ minHeight: "100vh" }}
      >
        <Container size="lg" py={48}>
          <Skeleton height={40} width={200} mb={32} />
          <Skeleton height={200} radius="md" mb={24} />
          <Skeleton height={200} radius="md" />
        </Container>
      </Box>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <Stack gap="xl">
            {/* Profile Photo */}
            <Card
              withBorder
              radius="md"
              padding="lg"
              bg={getBg(colorScheme, "white", "#2c2e33")}
            >
              <Group justify="space-between" align="flex-start">
                <Box>
                  <Text
                    fw={500}
                    size="md"
                    mb={4}
                    c={getTextColor(colorScheme, "black", "white")}
                  >
                    Profile photo
                  </Text>
                  <Text size="xs" c="dimmed">
                    Your photo helps others recognize you
                  </Text>
                </Box>
                <Group gap="lg">
                  <Avatar size={64} radius={64} src={profileImage} color="blue">
                    {!profileImage && <IconUser size={32} />}
                  </Avatar>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                  <Button
                    variant="light"
                    leftSection={<IconCamera size={16} />}
                    onClick={() => fileInputRef.current.click()}
                    size="sm"
                  >
                    Change
                  </Button>
                </Group>
              </Group>
            </Card>

            {/* Personal Details */}
            <Card
              withBorder
              radius="md"
              padding="lg"
              bg={getBg(colorScheme, "white", "#2c2e33")}
            >
              <Text
                fw={500}
                size="md"
                mb="lg"
                c={getTextColor(colorScheme, "black", "white")}
              >
                Personal details
              </Text>

              <Stack gap="md">
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <TextInput
                    label="First name"
                    value={user.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                  />
                  <TextInput
                    label="Last name"
                    value={user.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                  />
                </SimpleGrid>

                <TextInput
                  label="Email address"
                  value={user.email}
                  disabled
                  description="Your email cannot be changed"
                />

                <TextInput
                  label="Phone number"
                  value={user.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+251 XXX XXX XXX"
                />

                <TextInput
                  label="Address"
                  value={user.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="City, Ethiopia"
                />
              </Stack>
            </Card>

            {/* Sync Status */}
            <Card
              withBorder
              radius="md"
              padding="lg"
              bg={getBg(colorScheme, "white", "#2c2e33")}
            >
              <Group justify="space-between">
                <Box>
                  <Text
                    fw={500}
                    size="md"
                    c={getTextColor(colorScheme, "black", "white")}
                  >
                    Sync is on
                  </Text>
                  <Text size="xs" c="dimmed">
                    Your data is synced across devices
                  </Text>
                </Box>
                <Badge color="green" size="lg">
                  Active
                </Badge>
              </Group>
            </Card>
          </Stack>
        );

      case "autofill":
        return (
          <Card
            withBorder
            radius="md"
            padding="lg"
            bg={getBg(colorScheme, "white", "#2c2e33")}
          >
            <Text
              fw={500}
              size="md"
              mb="lg"
              c={getTextColor(colorScheme, "black", "white")}
            >
              Autofill and passwords
            </Text>

            <Stack gap="md">
              <Paper
                withBorder
                p="md"
                radius="md"
                bg={getBg(colorScheme, "white", "#2c2e33")}
              >
                <Group justify="space-between">
                  <Group>
                    <IconPassword size={20} color="#228be6" />
                    <Box>
                      <Text
                        size="sm"
                        fw={500}
                        c={getTextColor(colorScheme, "black", "white")}
                      >
                        Password Manager
                      </Text>
                      <Text size="xs" c="dimmed">
                        Manage saved passwords
                      </Text>
                    </Box>
                  </Group>
                  <Button variant="light" size="xs">
                    Manage
                  </Button>
                </Group>
              </Paper>

              <Paper
                withBorder
                p="md"
                radius="md"
                bg={getBg(colorScheme, "white", "#2c2e33")}
              >
                <Group justify="space-between">
                  <Group>
                    <IconAddressBook size={20} color="#228be6" />
                    <Box>
                      <Text
                        size="sm"
                        fw={500}
                        c={getTextColor(colorScheme, "black", "white")}
                      >
                        Addresses and more
                      </Text>
                      <Text size="xs" c="dimmed">
                        Save addresses for faster form filling
                      </Text>
                    </Box>
                  </Group>
                  <Switch size="md" defaultChecked />
                </Group>
              </Paper>

              <Paper
                withBorder
                p="md"
                radius="md"
                bg={getBg(colorScheme, "white", "#2c2e33")}
              >
                <Group justify="space-between">
                  <Group>
                    <IconPayment size={20} color="#228be6" />
                    <Box>
                      <Text
                        size="sm"
                        fw={500}
                        c={getTextColor(colorScheme, "black", "white")}
                      >
                        Payment methods
                      </Text>
                      <Text size="xs" c="dimmed">
                        Securely save your payment info
                      </Text>
                    </Box>
                  </Group>
                  <Button variant="light" size="xs">
                    Add
                  </Button>
                </Group>
              </Paper>
            </Stack>
          </Card>
        );

      case "payment-methods":
        return (
          <Card
            withBorder
            radius="md"
            padding="lg"
            bg={getBg(colorScheme, "white", "#2c2e33")}
          >
            <Text
              fw={500}
              size="md"
              mb="lg"
              c={getTextColor(colorScheme, "black", "white")}
            >
              Payment methods
            </Text>

            <Stack gap="md">
              <Alert
                color="blue"
                variant="light"
                icon={<IconInfoCircle size={16} />}
              >
                Your payment info is encrypted and secure
              </Alert>

              <Paper
                withBorder
                p="md"
                radius="md"
                bg={getBg(colorScheme, "white", "#2c2e33")}
              >
                <Group justify="space-between">
                  <Group>
                    <IconCreditCard size={20} />
                    <Box>
                      <Text
                        size="sm"
                        fw={500}
                        c={getTextColor(colorScheme, "black", "white")}
                      >
                        •••• •••• •••• 4242
                      </Text>
                      <Text size="xs" c="dimmed">
                        Expires 12/25
                      </Text>
                    </Box>
                  </Group>
                  <Badge color="green" size="sm">
                    Default
                  </Badge>
                </Group>
              </Paper>

              <Button variant="light" fullWidth>
                Add payment method
              </Button>
            </Stack>
          </Card>
        );

      case "addresses":
        return (
          <Card
            withBorder
            radius="md"
            padding="lg"
            bg={getBg(colorScheme, "white", "#2c2e33")}
          >
            <Text
              fw={500}
              size="md"
              mb="lg"
              c={getTextColor(colorScheme, "black", "white")}
            >
              Saved addresses
            </Text>

            <Stack gap="md">
              <Paper
                withBorder
                p="md"
                radius="md"
                bg={getBg(colorScheme, "white", "#2c2e33")}
              >
                <Group justify="space-between">
                  <Box>
                    <Text
                      size="sm"
                      fw={500}
                      c={getTextColor(colorScheme, "black", "white")}
                    >
                      Home
                    </Text>
                    <Text size="xs" c="dimmed">
                      Addis Ababa, Ethiopia
                    </Text>
                  </Box>
                  <ActionIcon variant="subtle" color="blue">
                    <IconEdit size={16} />
                  </ActionIcon>
                </Group>
              </Paper>

              <Paper
                withBorder
                p="md"
                radius="md"
                bg={getBg(colorScheme, "white", "#2c2e33")}
              >
                <Group justify="space-between">
                  <Box>
                    <Text
                      size="sm"
                      fw={500}
                      c={getTextColor(colorScheme, "black", "white")}
                    >
                      Work
                    </Text>
                    <Text size="xs" c="dimmed">
                      Bole, Addis Ababa
                    </Text>
                  </Box>
                  <ActionIcon variant="subtle" color="blue">
                    <IconEdit size={16} />
                  </ActionIcon>
                </Group>
              </Paper>

              <Button variant="light" fullWidth>
                Add address
              </Button>
            </Stack>
          </Card>
        );

      case "privacy":
        return (
          <Card
            withBorder
            radius="md"
            padding="lg"
            bg={getBg(colorScheme, "white", "#2c2e33")}
          >
            <Text
              fw={500}
              size="md"
              mb="lg"
              c={getTextColor(colorScheme, "black", "white")}
            >
              Privacy and security
            </Text>

            <Stack gap="md">
              <Group justify="space-between">
                <Box>
                  <Text
                    size="sm"
                    fw={500}
                    c={getTextColor(colorScheme, "black", "white")}
                  >
                    Cookies
                  </Text>
                  <Text size="xs" c="dimmed">
                    Allow sites to save cookies
                  </Text>
                </Box>
                <Select
                  defaultValue="allow"
                  data={["Allow all", "Block third-party", "Block all"]}
                  size="xs"
                />
              </Group>

              <Group justify="space-between">
                <Box>
                  <Text
                    size="sm"
                    fw={500}
                    c={getTextColor(colorScheme, "black", "white")}
                  >
                    Do Not Track
                  </Text>
                  <Text size="xs" c="dimmed">
                    Request sites not to track you
                  </Text>
                </Box>
                <Switch size="md" />
              </Group>

              <Group justify="space-between">
                <Box>
                  <Text
                    size="sm"
                    fw={500}
                    c={getTextColor(colorScheme, "black", "white")}
                  >
                    Clear browsing data
                  </Text>
                  <Text size="xs" c="dimmed">
                    Clear history, cookies, and cache
                  </Text>
                </Box>
                <Button variant="light" size="xs">
                  Clear
                </Button>
              </Group>
            </Stack>
          </Card>
        );

      case "security":
        return (
          <Stack gap="xl">
            <Card
              withBorder
              radius="md"
              padding="lg"
              bg={getBg(colorScheme, "white", "#2c2e33")}
            >
              <Text
                fw={500}
                size="md"
                mb="lg"
                c={getTextColor(colorScheme, "black", "white")}
              >
                Password
              </Text>

              <Button
                variant="light"
                leftSection={<IconKey size={16} />}
                onClick={openPwd}
                fullWidth
              >
                Change password
              </Button>
            </Card>

            <Card
              withBorder
              radius="md"
              padding="lg"
              bg={getBg(colorScheme, "white", "#2c2e33")}
            >
              <Group justify="space-between" mb="lg">
                <Box>
                  <Text
                    fw={500}
                    size="md"
                    c={getTextColor(colorScheme, "black", "white")}
                  >
                    Two-factor authentication
                  </Text>
                  <Text size="xs" c="dimmed">
                    Add an extra layer of security
                  </Text>
                </Box>
                <Switch
                  size="md"
                  checked={twoFactorEnabled}
                  onChange={(e) =>
                    handleTwoFactorToggle(e.currentTarget.checked)
                  }
                />
              </Group>

              <Collapse in={show2FASetup}>
                <Paper
                  withBorder
                  p="md"
                  radius="md"
                  mt="md"
                  bg={getBg(colorScheme, "white", "#2c2e33")}
                >
                  {setupMode === "setup" ? (
                    <Stack gap="md">
                      <Alert
                        color="blue"
                        variant="light"
                        icon={<IconInfoCircle size={16} />}
                      >
                        Set up a 6-digit PIN
                      </Alert>
                      <SimpleGrid cols={2}>
                        <PinInput
                          length={6}
                          type="number"
                          value={pinValue}
                          onChange={setPinValue}
                          size="md"
                        />
                        <PinInput
                          length={6}
                          type="number"
                          value={confirmPinValue}
                          onChange={setConfirmPinValue}
                          size="md"
                        />
                      </SimpleGrid>
                      {pinError && (
                        <Text c="red" size="xs">
                          {pinError}
                        </Text>
                      )}
                      <Group justify="flex-end">
                        <Button
                          size="xs"
                          variant="subtle"
                          onClick={cancel2FASetup}
                        >
                          Cancel
                        </Button>
                        <Button size="xs" onClick={handleEnable2FA}>
                          Enable
                        </Button>
                      </Group>
                    </Stack>
                  ) : (
                    <Stack gap="md">
                      <Alert
                        color="red"
                        variant="light"
                        icon={<IconAlertTriangle size={16} />}
                      >
                        Disable two-factor authentication?
                      </Alert>
                      <Group justify="flex-end">
                        <Button
                          size="xs"
                          variant="subtle"
                          onClick={cancel2FASetup}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="xs"
                          color="red"
                          onClick={handleDisable2FA}
                        >
                          Disable
                        </Button>
                      </Group>
                    </Stack>
                  )}
                </Paper>
              </Collapse>
            </Card>

            <Card
              withBorder
              radius="md"
              padding="lg"
              bg={getBg(colorScheme, "white", "#2c2e33")}
            >
              <Text
                fw={500}
                size="md"
                mb="lg"
                c={getTextColor(colorScheme, "black", "white")}
              >
                Login history
              </Text>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Box>
                    <Text
                      size="sm"
                      fw={500}
                      c={getTextColor(colorScheme, "black", "white")}
                    >
                      Current session
                    </Text>
                    <Text size="xs" c="dimmed">
                      Addis Ababa, Ethiopia · Chrome on Windows
                    </Text>
                  </Box>
                  <Badge color="green">Active</Badge>
                </Group>
                <Group justify="space-between">
                  <Box>
                    <Text
                      size="sm"
                      fw={500}
                      c={getTextColor(colorScheme, "black", "white")}
                    >
                      Feb 28, 2026
                    </Text>
                    <Text size="xs" c="dimmed">
                      Mobile · Addis Ababa
                    </Text>
                  </Box>
                  <ActionIcon variant="subtle" color="red" size="sm">
                    <IconX size={14} />
                  </ActionIcon>
                </Group>
              </Stack>
            </Card>
          </Stack>
        );

      case "appearance":
        return (
          <Card
            withBorder
            radius="md"
            padding="lg"
            bg={getBg(colorScheme, "white", "#2c2e33")}
          >
            <Text
              fw={500}
              size="md"
              mb="lg"
              c={getTextColor(colorScheme, "black", "white")}
            >
              Appearance
            </Text>

            <Stack gap="md">
              <Group justify="space-between">
                <Box>
                  <Text
                    size="sm"
                    fw={500}
                    c={getTextColor(colorScheme, "black", "white")}
                  >
                    Theme
                  </Text>
                  <Text size="xs" c="dimmed">
                    Choose your color scheme
                  </Text>
                </Box>
                <Chip.Group value={colorScheme} onChange={setColorScheme}>
                  <Group gap="xs">
                    <Chip value="light" size="sm">
                      Light
                    </Chip>
                    <Chip value="dark" size="sm">
                      Dark
                    </Chip>
                    <Chip value="auto" size="sm">
                      System
                    </Chip>
                  </Group>
                </Chip.Group>
              </Group>

              <Divider />

              <Box>
                <Text
                  size="sm"
                  fw={500}
                  mb="sm"
                  c={getTextColor(colorScheme, "black", "white")}
                >
                  Font size
                </Text>
                <Group>
                  <Text size="xs">A</Text>
                  <Slider
                    value={fontSize}
                    onChange={setFontSize}
                    min={12}
                    max={24}
                    step={1}
                    style={{ flex: 1 }}
                  />
                  <Text size="lg">A</Text>
                </Group>
                <Text size="xs" c="dimmed" mt={4}>
                  Preview: This is how text will appear
                </Text>
              </Box>
            </Stack>
          </Card>
        );

      case "languages":
        return (
          <Card
            withBorder
            radius="md"
            padding="lg"
            bg={getBg(colorScheme, "white", "#2c2e33")}
          >
            <Text
              fw={500}
              size="md"
              mb="lg"
              c={getTextColor(colorScheme, "black", "white")}
            >
              Languages
            </Text>

            <Stack gap="md">
              <Select
                label="Preferred language"
                defaultValue="en"
                data={[
                  { value: "en", label: "English" },
                  { value: "am", label: "አማርኛ" },
                  { value: "or", label: "Oromoo" },
                  { value: "ti", label: "ትግርኛ" },
                ]}
              />

              <Group justify="space-between">
                <Box>
                  <Text
                    size="sm"
                    fw={500}
                    c={getTextColor(colorScheme, "black", "white")}
                  >
                    Translate pages
                  </Text>
                  <Text size="xs" c="dimmed">
                    Offer to translate pages you read
                  </Text>
                </Box>
                <Switch defaultChecked size="md" />
              </Group>
            </Stack>
          </Card>
        );

      case "notifications":
        return (
          <Card
            withBorder
            radius="md"
            padding="lg"
            bg={getBg(colorScheme, "white", "#2c2e33")}
          >
            <Text
              fw={500}
              size="md"
              mb="lg"
              c={getTextColor(colorScheme, "black", "white")}
            >
              Notifications
            </Text>

            <Stack gap="md">
              <Group justify="space-between">
                <Box>
                  <Text
                    size="sm"
                    fw={500}
                    c={getTextColor(colorScheme, "black", "white")}
                  >
                    Vehicle alerts
                  </Text>
                  <Text size="xs" c="dimmed">
                    Get notified about vehicle detection
                  </Text>
                </Box>
                <Switch defaultChecked size="md" />
              </Group>

              <Group justify="space-between">
                <Box>
                  <Text
                    size="sm"
                    fw={500}
                    c={getTextColor(colorScheme, "black", "white")}
                  >
                    Person alerts
                  </Text>
                  <Text size="xs" c="dimmed">
                    Get notified about person detection
                  </Text>
                </Box>
                <Switch defaultChecked size="md" />
              </Group>

              <Divider label="Delivery methods" labelPosition="center" />

              <Group justify="space-between">
                <Box>
                  <Text
                    size="sm"
                    fw={500}
                    c={getTextColor(colorScheme, "black", "white")}
                  >
                    Push notifications
                  </Text>
                  <Text size="xs" c="dimmed">
                    Instant alerts on your device
                  </Text>
                </Box>
                <Switch defaultChecked size="md" />
              </Group>

              <Group justify="space-between">
                <Box>
                  <Text
                    size="sm"
                    fw={500}
                    c={getTextColor(colorScheme, "black", "white")}
                  >
                    Email notifications
                  </Text>
                  <Text size="xs" c="dimmed">
                    Receive updates via email
                  </Text>
                </Box>
                <Switch defaultChecked size="md" />
              </Group>

              <Group justify="space-between">
                <Box>
                  <Text
                    size="sm"
                    fw={500}
                    c={getTextColor(colorScheme, "black", "white")}
                  >
                    SMS alerts
                  </Text>
                  <Text size="xs" c="dimmed">
                    Get text messages for urgent alerts
                  </Text>
                </Box>
                <Switch size="md" />
              </Group>
            </Stack>
          </Card>
        );

      case "alert-history":
        return (
          <Card
            withBorder
            radius="md"
            padding="lg"
            bg={getBg(colorScheme, "white", "#2c2e33")}
          >
            <Text
              fw={500}
              size="md"
              mb="lg"
              c={getTextColor(colorScheme, "black", "white")}
            >
              Alert history
            </Text>

            {alerts.map((alert) => (
              <Group
                key={alert.id}
                justify="space-between"
                py="sm"
                style={{
                  borderBottom: `1px solid ${getBorderColor(colorScheme)}`,
                }}
              >
                <Group gap="sm">
                  <Badge
                    color={alert.type === "Person" ? "blue" : "green"}
                    size="sm"
                  >
                    {alert.type}
                  </Badge>
                  <Box>
                    <Text
                      size="sm"
                      fw={500}
                      c={getTextColor(colorScheme, "black", "white")}
                    >
                      {alert.location}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {alert.time}
                    </Text>
                  </Box>
                </Group>
                <Badge
                  color={alert.status === "New" ? "yellow" : "gray"}
                  size="sm"
                  variant="light"
                >
                  {alert.status}
                </Badge>
              </Group>
            ))}

            <Button variant="subtle" fullWidth mt="md">
              View all alerts
            </Button>
          </Card>
        );

      case "performance":
        return (
          <Card
            withBorder
            radius="md"
            padding="lg"
            bg={getBg(colorScheme, "white", "#2c2e33")}
          >
            <Text
              fw={500}
              size="md"
              mb="lg"
              c={getTextColor(colorScheme, "black", "white")}
            >
              Performance
            </Text>

            <Stack gap="md">
              <Group justify="space-between">
                <Box>
                  <Text
                    size="sm"
                    fw={500}
                    c={getTextColor(colorScheme, "black", "white")}
                  >
                    Memory saver
                  </Text>
                  <Text size="xs" c="dimmed">
                    Free up memory from inactive tabs
                  </Text>
                </Box>
                <Switch defaultChecked size="md" />
              </Group>

              <Group justify="space-between">
                <Box>
                  <Text
                    size="sm"
                    fw={500}
                    c={getTextColor(colorScheme, "black", "white")}
                  >
                    Preload pages
                  </Text>
                  <Text size="xs" c="dimmed">
                    Faster browsing and searching
                  </Text>
                </Box>
                <Select
                  defaultValue="standard"
                  data={["Standard", "Extended", "No preloading"]}
                  size="xs"
                />
              </Group>
            </Stack>
          </Card>
        );

      case "downloads":
        return (
          <Card
            withBorder
            radius="md"
            padding="lg"
            bg={getBg(colorScheme, "white", "#2c2e33")}
          >
            <Text
              fw={500}
              size="md"
              mb="lg"
              c={getTextColor(colorScheme, "black", "white")}
            >
              Downloads
            </Text>

            <Stack gap="md">
              <TextInput
                label="Download location"
                defaultValue="/Downloads"
                rightSection={
                  <Button variant="light" size="xs">
                    Change
                  </Button>
                }
              />

              <Group justify="space-between">
                <Box>
                  <Text
                    size="sm"
                    fw={500}
                    c={getTextColor(colorScheme, "black", "white")}
                  >
                    Ask where to save each file
                  </Text>
                  <Text size="xs" c="dimmed">
                    Choose location before downloading
                  </Text>
                </Box>
                <Switch defaultChecked size="md" />
              </Group>
            </Stack>
          </Card>
        );

      case "accessibility":
        return (
          <Card
            withBorder
            radius="md"
            padding="lg"
            bg={getBg(colorScheme, "white", "#2c2e33")}
          >
            <Text
              fw={500}
              size="md"
              mb="lg"
              c={getTextColor(colorScheme, "black", "white")}
            >
              Accessibility
            </Text>

            <Stack gap="md">
              <Group justify="space-between">
                <Box>
                  <Text
                    size="sm"
                    fw={500}
                    c={getTextColor(colorScheme, "black", "white")}
                  >
                    Screen reader
                  </Text>
                  <Text size="xs" c="dimmed">
                    Optimize for screen readers
                  </Text>
                </Box>
                <Switch size="md" />
              </Group>

              <Group justify="space-between">
                <Box>
                  <Text
                    size="sm"
                    fw={500}
                    c={getTextColor(colorScheme, "black", "white")}
                  >
                    High contrast
                  </Text>
                  <Text size="xs" c="dimmed">
                    Increase color contrast
                  </Text>
                </Box>
                <Switch size="md" />
              </Group>

              <Box>
                <Text
                  size="sm"
                  fw={500}
                  mb="sm"
                  c={getTextColor(colorScheme, "black", "white")}
                >
                  Text scaling
                </Text>
                <Slider
                  defaultValue={100}
                  min={50}
                  max={200}
                  step={10}
                  label={(value) => `${value}%`}
                />
              </Box>
            </Stack>
          </Card>
        );

      case "system":
        return (
          <Card
            withBorder
            radius="md"
            padding="lg"
            bg={getBg(colorScheme, "white", "#2c2e33")}
          >
            <Text
              fw={500}
              size="md"
              mb="lg"
              c={getTextColor(colorScheme, "black", "white")}
            >
              System
            </Text>

            <Stack gap="md">
              <Group justify="space-between">
                <Box>
                  <Text
                    size="sm"
                    fw={500}
                    c={getTextColor(colorScheme, "black", "white")}
                  >
                    Background sync
                  </Text>
                  <Text size="xs" c="dimmed">
                    Allow sites to sync in background
                  </Text>
                </Box>
                <Switch defaultChecked size="md" />
              </Group>

              <Group justify="space-between">
                <Box>
                  <Text
                    size="sm"
                    fw={500}
                    c={getTextColor(colorScheme, "black", "white")}
                  >
                    Hardware acceleration
                  </Text>
                  <Text size="xs" c="dimmed">
                    Use when available
                  </Text>
                </Box>
                <Switch defaultChecked size="md" />
              </Group>

              <Divider />

              <Button
                variant="light"
                color="gray"
                fullWidth
                leftSection={<IconTrash size={16} />}
              >
                Clear system cache
              </Button>
            </Stack>
          </Card>
        );

      case "reset":
        return (
          <Card
            withBorder
            radius="md"
            padding="lg"
            bg={getBg(colorScheme, "white", "#2c2e33")}
            style={{ borderColor: "#ff6b6b" }}
          >
            <Text fw={500} size="md" mb="lg" c="red.7">
              Reset settings
            </Text>

            <Stack gap="md">
              <Alert
                color="red"
                variant="light"
                icon={<IconAlertTriangle size={16} />}
              >
                This will reset all your settings to default
              </Alert>

              <Button
                variant="light"
                color="red"
                fullWidth
                leftSection={<IconRefresh size={16} />}
                onClick={openReset}
              >
                Reset all settings
              </Button>
            </Stack>
          </Card>
        );

      default:
        return (
          <Card
            withBorder
            radius="md"
            padding="lg"
            bg={getBg(colorScheme, "white", "#2c2e33")}
          >
            <Text
              fw={500}
              size="md"
              c={getTextColor(colorScheme, "black", "white")}
            >
              Coming soon
            </Text>
            <Text size="sm" c="dimmed" mt="xs">
              This section is under development
            </Text>
          </Card>
        );
    }
  };

  return (
    <Box
      bg={getBg(colorScheme, "#fff", "#1a1b1e")}
      style={{ minHeight: "100vh" }}
    >
      {/* Header */}
      <Box
        bg={getBg(colorScheme, "#fff", "#1a1b1e")}
        style={{
          borderBottom: `1px solid ${getBorderColor(colorScheme)}`,
          padding: "12px 24px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Group justify="space-between">
          <Group gap="sm">
            <ActionIcon
              variant="subtle"
              onClick={() => router.back()}
              size="lg"
              color={getTextColor(colorScheme, "gray", "white")}
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title
              order={4}
              fw={400}
              c={getTextColor(colorScheme, "black", "white")}
            >
              Settings
            </Title>
          </Group>
          {dirty && (
            <Button
              leftSection={<IconDeviceFloppy size={16} />}
              color="blue"
              size="sm"
              onClick={handleSaveChanges}
              loading={saving}
            >
              Save changes
            </Button>
          )}
        </Group>
      </Box>

      {/* Main Content */}
      <Flex justify="center">
        {/* Sidebar - Chrome style */}
        <Box
          w={300}
          bg={getBg(colorScheme, "#fff", "#1a1b1e")}
          style={{
            borderRight: `1px solid ${getBorderColor(colorScheme)}`,
            height: "calc(100vh - 70px)",
            position: "sticky",
            top: 70,
            overflowY: "auto",
          }}
          p="md"
        >
          <Stack gap="lg">
            {navGroups.map((group, idx) => (
              <Box key={idx}>
                {group.title && (
                  <Text
                    size="xs"
                    fw={600}
                    c="dimmed"
                    tt="uppercase"
                    mb="xs"
                    px="md"
                  >
                    {group.title}
                  </Text>
                )}
                <Stack gap={2}>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <UnstyledButton
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        style={{
                          padding: "10px 16px",
                          borderRadius: "8px",
                          backgroundColor: isActive
                            ? colorScheme === "dark"
                              ? "#2c2e33"
                              : "#e8f0fe"
                            : "transparent",
                          color: item.danger ? "#fa5252" : "inherit",
                        }}
                      >
                        <Group gap="sm">
                          <Icon
                            size={18}
                            color={
                              isActive
                                ? "#228be6"
                                : item.danger
                                  ? "#fa5252"
                                  : "#5f6368"
                            }
                          />
                          <Text
                            size="sm"
                            c={
                              isActive
                                ? "blue"
                                : item.danger
                                  ? "red.6"
                                  : getTextColor(colorScheme, "black", "white")
                            }
                          >
                            {item.label}
                          </Text>
                        </Group>
                      </UnstyledButton>
                    );
                  })}
                </Stack>
              </Box>
            ))}

            <Divider my="md" color={getBorderColor(colorScheme)} />

            <UnstyledButton
              onClick={handleLogout}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
              }}
            >
              <Group gap="sm">
                <IconLogout size={18} color="#fa5252" />
                <Text size="sm" c="red.6">
                  Sign out
                </Text>
              </Group>
            </UnstyledButton>
          </Stack>
        </Box>

        {/* Content Area */}
        <Box
          style={{ flex: 1, padding: "32px", maxWidth: 900, margin: "0 auto" }}
        >
          {renderContent()}
        </Box>
      </Flex>

      {/* Modals - Same theme */}
      <Modal
        opened={pwdOpened}
        onClose={closePwd}
        title="Change password"
        centered
        size="md"
        radius="md"
      >
        <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)}>
          <Stack gap="md">
            <PasswordInput
              label="Current password"
              {...passwordForm.register("currentPassword")}
              error={passwordForm.formState.errors.currentPassword?.message}
            />

            <PasswordInput
              label="New password"
              {...passwordForm.register("newPassword")}
              error={passwordForm.formState.errors.newPassword?.message}
            />

            {passwordForm.watch("newPassword") && (
              <Box>
                <Group justify="space-between" mb={4}>
                  <Text size="xs" c="dimmed">
                    Password strength
                  </Text>
                  <Text size="xs" fw={600} c={getPasswordStrengthColor()}>
                    {getPasswordStrengthLabel()}
                  </Text>
                </Group>
                <Progress
                  value={passwordStrength}
                  color={getPasswordStrengthColor()}
                  size="sm"
                />
              </Box>
            )}

            <PasswordInput
              label="Confirm new password"
              {...passwordForm.register("confirmPassword")}
              error={passwordForm.formState.errors.confirmPassword?.message}
            />

            <Button type="submit" color="blue" fullWidth>
              Update password
            </Button>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={deleteOpened}
        onClose={closeDelete}
        title="Delete account"
        centered
        size="md"
        radius="md"
      >
        <Stack gap="md">
          <Alert
            color="red"
            variant="light"
            icon={<IconAlertTriangle size={16} />}
          >
            This action is permanent and cannot be undone.
          </Alert>

          <Text size="sm">All your data will be permanently deleted.</Text>

          <Group grow>
            <Button variant="default" onClick={closeDelete}>
              Cancel
            </Button>
            <Button color="red" onClick={handleLogout}>
              Delete account
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={resetOpened}
        onClose={closeReset}
        title="Reset settings"
        centered
        size="md"
        radius="md"
      >
        <Stack gap="md">
          <Alert
            color="red"
            variant="light"
            icon={<IconAlertTriangle size={16} />}
          >
            This will reset all your settings to default
          </Alert>

          <Text size="sm">Your saved data will not be affected.</Text>

          <Group grow>
            <Button variant="default" onClick={closeReset}>
              Cancel
            </Button>
            <Button color="red" onClick={closeReset}>
              Reset
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
