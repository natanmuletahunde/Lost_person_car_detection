/* eslint-disable react/no-unescaped-entities */
"use client";

import {
  Box,
  Container,
  Title,
  Text,
  Button,
  Group,
  TextInput,
  Avatar,
  Paper,
  SimpleGrid,
  ScrollArea,
  Card,
  Grid,
  ActionIcon,
  Menu,
  UnstyledButton,
  Stack,
  Badge,
  useMantineTheme,
  Flex,
  Table,
  useMantineColorScheme,
  Loader,
  Center,
  Alert,
  Divider,
  Indicator,
} from "@mantine/core";
import {
  IconSearch,
  IconChevronRight,
  IconArrowRight,
  IconBell,
  IconUser,
  IconHistory,
  IconSettings,
  IconLogout,
  IconShieldCheck,
  IconStarFilled,
  IconChevronLeft,
  IconMail,
  IconPhone,
  IconCalendar,
  IconMapPin,
  IconLogin,
  IconUserPlus,
  IconQuote,
  IconCar,
  IconUser as IconUserPerson,
  IconCheck,
  IconHeart,
  IconGlobe,
  IconTarget,
  IconChartBar,
  IconFileReport,
  IconHome,
  IconChartLine,
  IconUsers,
  IconMapPin as IconLocation,
  IconClock,
  IconAlertCircle,
  IconFolder,
  IconDatabase,
  IconListDetails,
  IconEye,
  IconEdit,
  IconTrash,
  IconFilter,
  IconSortAscending,
  IconDownload,
  IconRefresh,
  IconSun,
  IconMoon,
  IconPlus,
  IconMap,
  IconMessageCircle,
  IconGps,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MainFooter from "../components/MainFooter";
import { useMediaQuery } from "@mantine/hooks";
import { Carousel } from "@mantine/carousel";
import "@mantine/carousel/styles.css";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import GpsTracker from "../components/GpsTracker";

// Dynamically import map to avoid SSR issues
const LocationPicker = dynamic(() => import("../components/LocationPicker"), {
  ssr: false,
  loading: () => (
    <Box
      style={{
        height: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f5ff",
        borderRadius: "12px",
      }}
    >
      <Loader size="lg" color="#2f80ed" />
    </Box>
  ),
});

// API endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const MISSING_PERSONS_API = `${API_BASE_URL}/missingPersons`;
const MISSING_VEHICLES_API = `${API_BASE_URL}/missingVehicles`;
const SIGHTINGS_API = `${API_BASE_URL}/sightings`;
const NOTIFICATIONS_API = `${API_BASE_URL}/notifications`;

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missingPersons, setMissingPersons] = useState([]);
  const [missingVehicles, setMissingVehicles] = useState([]);
  const [userReports, setUserReports] = useState([]);
  const [recentSightings, setRecentSightings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  // Helper to get dynamic background colors
  const getBg = (light, dark) => (colorScheme === 'dark' ? dark : light);

  useEffect(() => {
    const checkAuth = async () => {
      const userData = localStorage.getItem("currentUser");

      if (userData) {
        const parsedUser = JSON.parse(userData);

        // Redirect admin users to admin page
        if (parsedUser.role && parsedUser.role.toLowerCase() === "admin") {
          router.push("/admin");
          return;
        }

        setUser(parsedUser);
      }
      setLoading(false);
    };

    checkAuth();

    const handleStorageChange = (e) => {
      if (e.key === "currentUser") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [router]);

  // Fetch missing persons and vehicles
  useEffect(() => {
    const fetchMissingData = async () => {
      setDataLoading(true);
      try {
        const [personsRes, vehiclesRes] = await Promise.all([
          fetch(MISSING_PERSONS_API),
          fetch(MISSING_VEHICLES_API),
        ]);

        if (personsRes.ok) {
          const persons = await personsRes.json();
          setMissingPersons(persons.filter(p => p.status === 'Active'));
        }
        if (vehiclesRes.ok) {
          const vehicles = await vehiclesRes.json();
          setMissingVehicles(vehicles.filter(v => v.status === 'Active'));
        }
      } catch (error) {
        console.error('Error fetching missing data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchMissingData();
  }, []);

  // Fetch recent sightings
  useEffect(() => {
    const fetchSightings = async () => {
      try {
        const res = await fetch(SIGHTINGS_API);
        if (res.ok) {
          const data = await res.json();
          const sorted = data.sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));
          setRecentSightings(sorted.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching sightings:', error);
      }
    };
    fetchSightings();
  }, []);

  // Fetch notifications (demo)
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(NOTIFICATIONS_API);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
          setUnreadCount(data.filter(n => !n.read).length);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Fallback demo data
        const demo = [
          { id: 1, message: "New sighting of your reported car", time: "5 min ago", read: false },
          { id: 2, message: "Case #123 status changed to Resolved", time: "1 hour ago", read: false },
          { id: 3, message: "Someone commented on your report", time: "yesterday", read: true },
        ];
        setNotifications(demo);
        setUnreadCount(demo.filter(n => !n.read).length);
      }
    };
    fetchNotifications();
  }, []);

  // Fetch user's reports if logged in
  useEffect(() => {
    const fetchUserReports = async () => {
      if (!user) return;

      try {
        const [personsRes, vehiclesRes] = await Promise.all([
          fetch(MISSING_PERSONS_API),
          fetch(MISSING_VEHICLES_API),
        ]);

        let reports = [];

        if (personsRes.ok) {
          const persons = await personsRes.json();
          reports = reports.concat(persons.filter(p => p.reportedBy?.userId === user.id));
        }
        if (vehiclesRes.ok) {
          const vehicles = await vehiclesRes.json();
          reports = reports.concat(vehicles.filter(v => v.reportedBy?.userId === user.id));
        }

        setUserReports(reports);
      } catch (error) {
        console.error('Error fetching user reports:', error);
      }
    };

    fetchUserReports();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("currentUser");
    setUser(null);
  };

  const getUserInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'blue';
      case 'resolved': return 'green';
      case 'investigation': return 'orange';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <Box
          style={{
            background: getBg("rgba(255,255,255,0.95)", theme.colors.dark[7]),
            padding: "40px",
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            textAlign: "center",
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              border: "4px solid #2f80ed",
              borderTopColor: "transparent",
              margin: "0 auto 20px",
            }}
          />
          <Text size="lg" fw={700} style={{ color: "#2f80ed" }}>
            Loading your dashboard...
          </Text>
          <Text size="sm" c="dimmed" mt="sm">
            Please wait a moment
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      bg={getBg("white", theme.colors.dark[7])}
      style={{ minHeight: "100vh" }}
    >
      {/* --- HEADER --- */}
      <Box
        bg={getBg("white", theme.colors.dark[7])}
        py={{ base: "xs", md: "sm" }}
        style={{
          borderBottom: `1px solid ${getBg(theme.colors.gray[2], theme.colors.dark[5])}`,
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(10px)",
          background: getBg("rgba(255,255,255,0.95)", `rgba(${theme.colors.dark[7]},0.95)`),
        }}
      >
        <Container size="xl">
          <Group justify="space-between" wrap="nowrap">
            {/* Logo */}
            <Link href="/" style={{ flexShrink: 0 }}>
              <Image
                src="/logo.jpg"
                alt="Logo"
                width={120}
                height={40}
                style={{
                  width: "auto",
                  height: "40px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              />
            </Link>

            <TextInput
              placeholder="Search lost items, cars, or people..."
              leftSection={<IconSearch size={16} />}
              style={{
                flex: 1,
                maxWidth: isMobile ? "200px" : "400px",
                minWidth: isMobile ? "150px" : "300px",
              }}
              radius="xl"
              size={isMobile ? "sm" : "md"}
              variant="filled"
            />

            <Group gap={isMobile ? "xs" : "md"} wrap="nowrap">
              {/* Notification Bell with Dropdown */}
              <Menu
                shadow="md"
                width={320}
                position="bottom-end"
                closeOnItemClick={false}
              >
                <Menu.Target>
                  <Indicator
                    inline
                    label={unreadCount}
                    size={16}
                    color="red"
                    disabled={unreadCount === 0}
                  >
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size={isMobile ? "md" : "lg"}
                    >
                      <IconBell size={isMobile ? 20 : 24} />
                    </ActionIcon>
                  </Indicator>
                </Menu.Target>
                <Menu.Dropdown>
                  <Box p="xs" fw={700} style={{ borderBottom: `1px solid ${getBg(theme.colors.gray[2], theme.colors.dark[5])}` }}>
                    Notifications
                  </Box>
                  <ScrollArea h={250}>
                    {notifications.length === 0 ? (
                      <Text ta="center" c="dimmed" py="md">No notifications</Text>
                    ) : (
                      notifications.map((n) => (
                        <Menu.Item key={n.id}>
                          <Group gap="sm" wrap="nowrap">
                            <Box>
                              <Text size="sm" fw={n.read ? 400 : 700}>{n.message}</Text>
                              <Text size="xs" c="dimmed">{n.time}</Text>
                            </Box>
                            {!n.read && <Badge size="xs" color="red" variant="filled">new</Badge>}
                          </Group>
                        </Menu.Item>
                      ))
                    )}
                  </ScrollArea>
                  <Menu.Divider />
                  <Menu.Item component={Link} href="/notifications">View all</Menu.Item>
                </Menu.Dropdown>
              </Menu>

              {/* Dark Mode Toggle */}
              <ActionIcon
                variant="subtle"
                color="gray"
                size={isMobile ? "md" : "lg"}
                onClick={() => toggleColorScheme()}
                title="Toggle color scheme"
              >
                {colorScheme === 'dark' ? (
                  <IconSun size={isMobile ? 20 : 24} />
                ) : (
                  <IconMoon size={isMobile ? 20 : 24} />
                )}
              </ActionIcon>

              {user ? (
                <Menu
                  shadow="md"
                  width={320}
                  radius="md"
                  transitionProps={{ transition: "pop-top-right" }}
                >
                  <Menu.Target>
                    <UnstyledButton>
                      <Group gap="sm" wrap="nowrap">
                        {!isMobile && (
                          <Box ta="right">
                            <Text fw={800} size="sm" truncate>
                              {user.firstName} {user.lastName}
                            </Text>
                            <Text
                              size="xs"
                              c="dimmed"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <IconMail size={10} />
                              {user.email}
                            </Text>
                          </Box>
                        )}
                        <Avatar
                          src={null}
                          alt={`${user.firstName} ${user.lastName}`}
                          color="blue"
                          size={isMobile ? "sm" : "md"}
                          radius="xl"
                          style={{
                            border: "2px solid #2f80ed",
                          }}
                        >
                          {getUserInitials(user.firstName, user.lastName)}
                        </Avatar>
                      </Group>
                    </UnstyledButton>
                  </Menu.Target>
                  <Menu.Dropdown
                    bg={getBg("white", theme.colors.dark[7])}
                    style={{ borderColor: getBg(theme.colors.gray[2], theme.colors.dark[5]) }}
                  >
                    <Box
                      mb="md"
                      pb="md"
                      style={{ borderBottom: `1px solid ${getBg(theme.colors.gray[2], theme.colors.dark[5])}` }}
                    >
                      <Group mb="xs">
                        <Avatar
                          src={null}
                          alt={`${user.firstName} ${user.lastName}`}
                          color="blue"
                          size="lg"
                          radius="xl"
                          style={{ border: "3px solid #2f80ed" }}
                        >
                          {getUserInitials(user.firstName, user.lastName)}
                        </Avatar>
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Text size="md" fw={700} truncate>
                            {user.firstName} {user.lastName}
                          </Text>
                          <Text size="sm" c="dimmed" truncate>
                            {user.email}
                          </Text>
                          <Badge
                            size="xs"
                            color={user.role === "admin" ? "red" : "blue"}
                            variant="light"
                            mt={4}
                          >
                            {user.role}
                          </Badge>
                        </Box>
                      </Group>
                      <Button
                        fullWidth
                        variant="light"
                        component={Link}
                        href="/profile"
                        leftSection={<IconUser size={16} />}
                        size="sm"
                      >
                        View Profile
                      </Button>
                    </Box>

                    <Stack gap={4}>
                      <Menu.Item
                        leftSection={<IconUser size={18} />}
                        component={Link}
                        href="/profile"
                      >
                        My Profile
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconFileReport size={18} />}
                        component={Link}
                        href="/reported-cases"
                      >
                        Reported Cases
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconBell size={18} />}
                        onClick={() => router.push("/alert")}
                      >
                        My Notifications
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconHistory size={18} />}
                        component={Link}
                        href="/history"
                      >
                        Search History
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconSettings size={18} />}
                        component={Link}
                        href="/settings"
                      >
                        Account Settings
                      </Menu.Item>
                    </Stack>
                    <Menu.Divider />
                    <Menu.Item
                      color="red"
                      leftSection={<IconLogout size={18} />}
                      onClick={handleLogout}
                    >
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ) : (
                <Group gap={isMobile ? "xs" : "sm"} wrap="nowrap">
                  <Button
                    variant="outline"
                    color="blue"
                    leftSection={<IconLogin size={16} />}
                    component={Link}
                    href="/login"
                    radius="xl"
                    size={isMobile ? "xs" : "sm"}
                  >
                    {isMobile ? "Login" : "Sign In"}
                  </Button>
                  <Button
                    color="blue"
                    leftSection={<IconUserPlus size={16} />}
                    component={Link}
                    href="/signup"
                    radius="xl"
                    size={isMobile ? "xs" : "sm"}
                    style={{
                      background: "linear-gradient(135deg, #2f80ed 0%, #1e56a0 100%)",
                    }}
                  >
                    {isMobile ? "Join" : "Sign Up"}
                  </Button>
                </Group>
              )}
            </Group>
          </Group>
        </Container>
      </Box>

      {/* --- HERO SECTION --- */}
      <Box
        bg="#2f80ed"
        style={{
          overflow: "hidden",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(135deg, #2f80ed 0%, #1e56a0 100%)",
          },
        }}
      >
        <Container size="xl" p={0}>
          <Grid gutter={0} align="stretch">
            <Grid.Col span={{ base: 12, md: 7 }} p={{ base: 40, md: 60 }}>
              <Stack
                gap="md"
                style={{ height: "100%", justifyContent: "center", position: "relative", zIndex: 1 }}
              >
                {user ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Title
                        order={1}
                        size={{ base: 32, md: 48, lg: 52 }}
                        fw={900}
                        mb={5}
                        c="white"
                        style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
                      >
                        Welcome back, {user.firstName}!
                      </Title>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <Title
                        order={2}
                        size={{ base: 24, md: 36, lg: 42 }}
                        fw={800}
                        mb={5}
                        c="white"
                      >
                        If you lost it we will find it
                      </Title>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Title
                        order={1}
                        size={{ base: 32, md: 48, lg: 52 }}
                        fw={900}
                        mb={5}
                        c="white"
                        style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
                      >
                        If you lost it we will find it
                      </Title>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <Title
                        order={2}
                        size={{ base: 24, md: 36, lg: 42 }}
                        fw={800}
                        mb={5}
                        c="white"
                      >
                        Join thousands who found their lost items
                      </Title>
                    </motion.div>
                  </>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Text
                    size={{ base: "md", md: "lg", lg: "xl" }}
                    mb="xl"
                    fw={600}
                    c="white"
                    maw={600}
                    style={{ opacity: 0.9 }}
                  >
                    Returning items is easier than ever with Flegas™ Black
                    Lions™ cloud based platform, accessible from any device.
                  </Text>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Group mb="xl" wrap={isMobile ? "wrap" : "nowrap"}>
                    {user ? (
                      <Button
                        component={Link}
                        href="/subscribe"
                        size={isMobile ? "md" : "xl"}
                        bg="black"
                        color="white"
                        radius="xl"
                        rightSection={<IconArrowRight size={20} />}
                        fullWidth={isMobile}
                        style={{
                          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            transition: "transform 0.2s",
                          },
                        }}
                      >
                        {user?.reportCount >= 1
                          ? "Report Missing Item (Upgrade)"
                          : "Report Missing Item"}
                      </Button>
                    ) : (
                      <Button
                        component={Link}
                        href="/signup"
                        size={isMobile ? "md" : "xl"}
                        bg="black"
                        color="white"
                        radius="xl"
                        rightSection={<IconArrowRight size={20} />}
                        fullWidth={isMobile}
                        style={{
                          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            transition: "transform 0.2s",
                          },
                        }}
                      >
                        Get Started Free
                      </Button>
                    )}
                    <Button
                      size={isMobile ? "md" : "xl"}
                      variant="outline"
                      color="white"
                      radius="xl"
                      rightSection={<IconArrowRight size={20} />}
                      component={Link}
                      href="/how-it-works"
                      fullWidth={isMobile}
                      style={{
                        borderWidth: 2,
                        "&:hover": {
                          background: "rgba(255,255,255,0.1)",
                        },
                      }}
                    >
                      How it works
                    </Button>
                  </Group>
                </motion.div>
                {user && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Group gap="md" wrap="wrap">
                      <Text
                        size="sm"
                        fw={500}
                        c="white"
                        style={{ display: "flex", alignItems: "center", gap: 4 }}
                      >
                        <IconCalendar size={14} />
                        Member since:{" "}
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Text>
                      <Badge color="green" variant="light" size="lg">
                        {user.isActive ? "Active Account" : "Inactive"}
                      </Badge>
                    </Group>
                  </motion.div>
                )}
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Box
                style={{
                  height: "100%",
                  minHeight: isMobile ? 300 : 450,
                  position: "relative",
                }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=1000"
                  alt="City"
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <Box
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "linear-gradient(to right, rgba(47, 128, 237, 0.9), rgba(47, 128, 237, 0.3))",
                  }}
                />
              </Box>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* --- QUICK ACTIONS --- */}
      <Container size="xl" py={{ base: 30, md: 40 }}>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mb="xl">
          <Button
            component={Link}
            href="/register"
            size="lg"
            radius="md"
            leftSection={<IconPlus size={20} />}
            fullWidth
            style={{
              background: "linear-gradient(135deg, #2f80ed 0%, #1e56a0 100%)",
              height: 80,
              fontSize: 18,
            }}
          >
            Report Missing
          </Button>
          <Button
            component={Link}
            href="/report-sighting"
            size="lg"
            radius="md"
            leftSection={<IconMap size={20} />}
            fullWidth
            variant="outline"
            color="blue"
            style={{
              height: 80,
              fontSize: 18,
              borderWidth: 2,
            }}
          >
            Report Sighting
          </Button>
        </SimpleGrid>
      </Container>

      {/* --- USER STATS DASHBOARD --- */}
      {user && (
        <Container size="xl" py={{ base: 30, md: 40 }}>
          <Paper
            p={{ base: "lg", md: "xl" }}
            radius="lg"
            bg={getBg("blue.0", "blue.9")}
            mb="xl"
            style={{
              boxShadow: "0 10px 30px rgba(47, 128, 237, 0.1)",
              border: `1px solid ${getBg("rgba(47,128,237,0.2)", "rgba(47,128,237,0.5)")}`,
            }}
          >
            <Group justify="space-between" mb="md">
              <Title order={3} style={{ color: "#2f80ed" }}>
                Your Dashboard Stats
              </Title>
              <Button
                variant="subtle"
                color="blue"
                size="sm"
                rightSection={<IconRefresh size={16} />}
                onClick={() => window.location.reload()}
              >
                Refresh
              </Button>
            </Group>
            <SimpleGrid cols={{ base: 2, sm: 2, md: 4 }} spacing="lg">
              {[
                { label: "Reports Filed", value: userReports.length, color: "blue", icon: <IconFileReport />, trend: `+${userReports.length}` },
                { label: "Items Found", value: userReports.filter(r => r.status === 'Resolved').length, color: "green", icon: <IconCheck />, trend: "+0" },
                { label: "Active Searches", value: userReports.filter(r => r.status === 'Active').length, color: "orange", icon: <IconSearch />, trend: "+0" },
                { label: "Community Help", value: 27, color: "grape", icon: <IconUsers />, trend: "+5" },
              ].map((stat, index) => (
                <Paper
                  key={index}
                  p="md"
                  bg={getBg("white", theme.colors.dark[6])}
                  radius="md"
                  withBorder
                  h="100%"
                  style={{
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Box style={{ color: `var(--mantine-color-${stat.color}-6)` }}>
                        {stat.icon}
                      </Box>
                      <Badge size="sm" color={stat.color} variant="light">
                        {stat.trend}
                      </Badge>
                    </Group>
                    <Title order={2} style={{ color: `var(--mantine-color-${stat.color}-6)` }}>
                      {stat.value}
                    </Title>
                    <Text size="sm" c="dimmed">
                      {stat.label}
                    </Text>
                  </Stack>
                </Paper>
              ))}
            </SimpleGrid>
          </Paper>
        </Container>
      )}

      {/* --- REPORTED CASES SECTION (For logged-in users) --- */}
      {user && userReports.length > 0 && (
        <Container size="xl" pb={{ base: 30, md: 40 }}>
          <Paper
            p={{ base: "md", md: "lg" }}
            radius="lg"
            withBorder
            shadow="sm"
            style={{
              background: getBg(
                "linear-gradient(to bottom, white, #f8f9fa)",
                `linear-gradient(to bottom, ${theme.colors.dark[6]}, ${theme.colors.dark[7]})`
              ),
            }}
          >
            <Group justify="space-between" mb="lg">
              <Flex align="center" gap="sm">
                <IconFileReport size={24} color="var(--mantine-color-blue-6)" />
                <Box>
                  <Title order={2} size="h3">
                    Your Recent Reports
                  </Title>
                  <Text size="sm" c="dimmed">
                    Track and manage your reported cases
                  </Text>
                </Box>
              </Flex>
              <Group gap="sm">
                <Button
                  variant="outline"
                  color="blue"
                  leftSection={<IconFilter size={16} />}
                  size="sm"
                >
                  Filter
                </Button>
                <Button
                  variant="outline"
                  color="blue"
                  leftSection={<IconSortAscending size={16} />}
                  size="sm"
                >
                  Sort
                </Button>
                <Button
                  color="blue"
                  leftSection={<IconDownload size={16} />}
                  size="sm"
                  style={{
                    background: "linear-gradient(135deg, #2f80ed 0%, #1e56a0 100%)",
                  }}
                >
                  Export
                </Button>
              </Group>
            </Group>

            {/* Reported Cases Table */}
            <ScrollArea>
              <Table
                verticalSpacing="md"
                horizontalSpacing="md"
                highlightOnHover
                withTableBorder
                withColumnBorders
                striped
                stripedColor={getBg(theme.colors.gray[0], theme.colors.dark[5])}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Case ID</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Priority</Table.Th>
                    <Table.Th>Location</Table.Th>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {userReports.slice(0, 6).map((caseItem) => (
                    <Table.Tr key={caseItem.id}>
                      <Table.Td>
                        <Text fw={600}>{caseItem.caseId || `#${caseItem.id}`}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          {caseItem.type === 'Vehicle' ? <IconCar size={16} /> : <IconUserPerson size={16} />}
                          <Text>{caseItem.type}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={getStatusColor(caseItem.status)}
                          variant="light"
                          size="sm"
                        >
                          {caseItem.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={getPriorityColor(caseItem.priority)}
                          variant="light"
                          size="sm"
                        >
                          {caseItem.priority || 'Medium'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <IconLocation size={14} />
                          <Text size="sm" lineClamp={1}>{caseItem.location}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {new Date(caseItem.reportDate || caseItem.lastSeenDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" wrap="nowrap">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            size="sm"
                            component={Link}
                            href={`/case/${caseItem.id}`}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="green"
                            size="sm"
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            {userReports.length > 6 && (
              <Group justify="space-between" mt="lg" pt="md" style={{ borderTop: `1px solid ${getBg(theme.colors.gray[2], theme.colors.dark[5])}` }}>
                <Text size="sm" c="dimmed">
                  Showing 6 of {userReports.length} cases
                </Text>
                <Button
                  variant="light"
                  color="blue"
                  rightSection={<IconChevronRight size={16} />}
                  component={Link}
                  href="/reported-cases"
                  radius="xl"
                >
                  View All Cases
                </Button>
              </Group>
            )}
          </Paper>
        </Container>
      )}

      {/* --- MAIN CONTENT --- */}
      <Container size="xl" py={{ base: 30, md: 40 }}>
        {/* Cars Section */}
        <Paper
          mb={{ base: 40, md: 60 }}
          p={{ base: "md", md: "lg" }}
          withBorder
          radius="lg"
          style={{
            boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
            background: getBg(
              "linear-gradient(to bottom, white, #f8f9fa)",
              `linear-gradient(to bottom, ${theme.colors.dark[6]}, ${theme.colors.dark[7]})`
            ),
          }}
        >
          <Group justify="space-between" mb="lg">
            <Flex align="center" gap="sm">
              <IconCar size={24} color="var(--mantine-color-blue-6)" />
              <Title order={2} size="h3">
                Have you seen this car?
              </Title>
            </Flex>
            <ActionIcon
              variant="light"
              radius="xl"
              color="blue"
              component={Link}
              href="/cars"
              size="lg"
            >
              <IconChevronRight />
            </ActionIcon>
          </Group>
          {dataLoading ? (
            <Center py="xl">
              <Loader color="blue" />
            </Center>
          ) : missingVehicles.length === 0 ? (
            <Alert icon={<IconAlertCircle size={16} />} title="No vehicles" color="blue" variant="light">
              No missing vehicles reported yet.
            </Alert>
          ) : (
            <ScrollArea w="100%" pb="xl">
              <Group wrap="nowrap" gap="lg">
                {missingVehicles.slice(0, 6).map((vehicle) => (
                  <Card
                    key={vehicle.id}
                    radius="md"
                    w={{ base: 240, sm: 280 }}
                    p={0}
                    withBorder
                    bg={getBg("white", theme.colors.dark[6])}
                    style={{
                      flexShrink: 0,
                      transition: "transform 0.3s",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    <Box style={{ position: "relative", height: 160, width: "100%" }}>
                      {vehicle.imagePreview ? (
                        <Image
                          src={vehicle.imagePreview}
                          fill
                          alt={vehicle.brand}
                          style={{ objectFit: "cover" }}
                          sizes="(max-width: 768px) 240px, 280px"
                        />
                      ) : (
                        <Box
                          bg="gray.2"
                          style={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <IconCar size={48} color="gray" />
                        </Box>
                      )}
                    </Box>
                    <Box p="xs">
                      <Text size="sm" fw={700} lineClamp={1}>
                        {vehicle.brand} {vehicle.model}
                      </Text>
                      {vehicle.submodel && (
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {vehicle.submodel}
                        </Text>
                      )}
                      <Group gap={4} mt={4}>
                        <IconMapPin size={12} />
                        <Text size="xs" lineClamp={1} style={{ flex: 1 }}>
                          {vehicle.location || "Location unknown"}
                        </Text>
                      </Group>
                      <Group gap="xs" mt={4} justify="space-between">
                        <Badge size="xs" color="blue" variant="light">
                          {vehicle.color || "N/A"}
                        </Badge>
                        <Text size="xs" fw={600} style={{ fontFamily: "monospace" }}>
                          {vehicle.plateNumber || "No plate"}
                        </Text>
                      </Group>
                      <Badge size="xs" color="red" variant="filled" fullWidth mt={6}>
                        ACTIVE
                      </Badge>

                      {/* Report Sighting Button */}
                      <Button
                        component={Link}
                        href={`/report-sighting?type=Vehicle&caseId=${vehicle.caseId || vehicle.id}&plateNumber=${encodeURIComponent(vehicle.plateNumber || '')}&brand=${encodeURIComponent(vehicle.brand)}&model=${encodeURIComponent(vehicle.model)}&location=${encodeURIComponent(vehicle.location || '')}`}
                        size="xs"
                        variant="light"
                        color="blue"
                        fullWidth
                        mt="xs"
                        leftSection={<IconMap size={14} />}
                      >
                        Report Sighting
                      </Button>
                    </Box>
                  </Card>
                ))}
              </Group>
            </ScrollArea>
          )}
        </Paper>

        {/* People Section */}
        <Paper
          mb={{ base: 40, md: 60 }}
          p={{ base: "md", md: "lg" }}
          withBorder
          radius="lg"
          style={{
            boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
            background: getBg(
              "linear-gradient(to bottom, white, #f8f9fa)",
              `linear-gradient(to bottom, ${theme.colors.dark[6]}, ${theme.colors.dark[7]})`
            ),
          }}
        >
          <Group justify="space-between" mb="lg">
            <Flex align="center" gap="sm">
              <IconUserPerson size={24} color="var(--mantine-color-blue-6)" />
              <Title order={2} size="h3">
                Have you seen this person?
              </Title>
            </Flex>
            <ActionIcon
              variant="light"
              radius="xl"
              color="blue"
              component={Link}
              href="/people"
              size="lg"
            >
              <IconChevronRight />
            </ActionIcon>
          </Group>
          {dataLoading ? (
            <Center py="xl">
              <Loader color="blue" />
            </Center>
          ) : missingPersons.length === 0 ? (
            <Alert icon={<IconAlertCircle size={16} />} title="No persons" color="blue" variant="light">
              No missing persons reported yet.
            </Alert>
          ) : (
            <ScrollArea w="100%" pb="xl">
              <Group wrap="nowrap" gap="lg">
                {missingPersons.slice(0, 6).map((person) => (
                  <Card
                    key={person.id}
                    radius="md"
                    w={{ base: 220, sm: 260 }}
                    p={0}
                    withBorder
                    bg={getBg("white", theme.colors.dark[6])}
                    style={{
                      flexShrink: 0,
                      transition: "transform 0.3s",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    <Box style={{ position: "relative", height: 200, width: "100%" }}>
                      {person.imagePreview ? (
                        <Image
                          src={person.imagePreview}
                          fill
                          alt={`${person.firstName} ${person.lastName}`}
                          style={{ objectFit: "cover" }}
                          sizes="(max-width: 768px) 220px, 260px"
                        />
                      ) : (
                        <Box
                          bg="gray.2"
                          style={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <IconUserPerson size={48} color="gray" />
                        </Box>
                      )}
                    </Box>
                    <Box p="xs">
                      <Text size="sm" fw={700} lineClamp={1}>
                        {person.firstName} {person.lastName}
                      </Text>
                      <Group gap="xs" mt={2}>
                        <Badge size="xs" color="pink" variant="light">
                          {person.gender || "Unknown"}
                        </Badge>
                        <Badge size="xs" color="cyan" variant="light">
                          Age {person.age || "?"}
                        </Badge>
                      </Group>
                      <Group gap={4} mt={4}>
                        <IconMapPin size={12} />
                        <Text size="xs" lineClamp={1} style={{ flex: 1 }}>
                          {person.location || "Location unknown"}
                        </Text>
                      </Group>
                      {person.description && (
                        <Text size="xs" c="dimmed" lineClamp={2} mt={4}>
                          {person.description}
                        </Text>
                      )}
                      <Badge size="xs" color="red" variant="filled" fullWidth mt={6}>
                        ACTIVE
                      </Badge>

                      {/* Report Sighting Button */}
                      <Button
                        component={Link}
                        href={`/report-sighting?type=Person&caseId=${person.caseId || person.id}&name=${encodeURIComponent(person.firstName + ' ' + person.lastName)}&location=${encodeURIComponent(person.location || '')}`}
                        size="xs"
                        variant="light"
                        color="blue"
                        fullWidth
                        mt="xs"
                        leftSection={<IconMap size={14} />}
                      >
                        Report Sighting
                      </Button>
                    </Box>
                  </Card>
                ))}
              </Group>
            </ScrollArea>
          )}
        </Paper>

        {/* Interactive Map Section */}
        <Paper
          mb={{ base: 40, md: 60 }}
          p={{ base: "md", md: "lg" }}
          withBorder
          radius="lg"
          style={{
            background: getBg(
              "linear-gradient(to bottom, white, #f8f9fa)",
              `linear-gradient(to bottom, ${theme.colors.dark[6]}, ${theme.colors.dark[7]})`
            ),
          }}
        >
          <Flex align="center" gap="sm" mb="lg">
            <IconMap size={24} color="var(--mantine-color-blue-6)" />
            <Title order={3}>Nearby Missing Items</Title>
          </Flex>
          <Box style={{ height: 400, borderRadius: "12px", overflow: "hidden" }}>
            <LocationPicker
              onLocationSelect={() => {}} // Read-only mode for dashboard
              initialPosition={[9.03, 38.74]}
              markers={[
                ...missingPersons.map(p => ({
                  lat: p.latitude || 9.03,
                  lng: p.longitude || 38.74,
                  title: `${p.firstName} ${p.lastName}`,
                  type: 'person',
                })),
                ...missingVehicles.map(v => ({
                  lat: v.latitude || 9.03,
                  lng: v.longitude || 38.74,
                  title: `${v.brand} ${v.model}`,
                  type: 'vehicle',
                })),
              ]}
            />
          </Box>
        </Paper>

        {/* Recent Sightings Feed */}
        <Paper
          mb={{ base: 40, md: 60 }}
          p={{ base: "md", md: "lg" }}
          withBorder
          radius="lg"
          style={{
            background: getBg(
              "linear-gradient(to bottom, white, #f8f9fa)",
              `linear-gradient(to bottom, ${theme.colors.dark[6]}, ${theme.colors.dark[7]})`
            ),
          }}
        >
          <Flex align="center" gap="sm" mb="lg">
            <IconMessageCircle size={24} color="var(--mantine-color-blue-6)" />
            <Title order={3}>Recent Sightings</Title>
          </Flex>
          {recentSightings.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">No recent sightings</Text>
          ) : (
            <Stack gap="md">
              {recentSightings.map((sighting) => (
                <Card key={sighting.id} withBorder p="sm" radius="md">
                  <Group gap="sm" align="flex-start">
                    <Avatar color="blue" radius="xl">
                      {sighting.type === 'Person' ? <IconUserPerson size={16} /> : <IconCar size={16} />}
                    </Avatar>
                    <Box style={{ flex: 1 }}>
                      <Text size="sm" fw={500}>
                        {sighting.type === 'Person' ? sighting.name : sighting.plateNumber}
                      </Text>
                      <Group gap="xs" mt={4}>
                        <IconMapPin size={12} />
                        <Text size="xs" c="dimmed" lineClamp={1}>{sighting.location}</Text>
                      </Group>
                      <Group gap="xs" mt={4}>
                        <IconClock size={12} />
                        <Text size="xs" c="dimmed">
                          {new Date(sighting.reportDate).toLocaleString()}
                        </Text>
                      </Group>
                    </Box>
                    <Badge size="sm" color="green">New</Badge>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Paper>

        {/* GPS Tracking Section */}
        <Paper
          mb={{ base: 40, md: 60 }}
          p={{ base: "md", md: "lg" }}
          withBorder
          radius="lg"
          style={{
            background: getBg(
              "linear-gradient(to bottom, white, #f8f9fa)",
              `linear-gradient(to bottom, ${theme.colors.dark[6]}, ${theme.colors.dark[7]})`
            ),
          }}
        >
          <Flex align="center" gap="sm" mb="lg">
            <IconGps size={24} color="var(--mantine-color-blue-6)" />
            <Title order={3}>GPS Smart Belt Tracking</Title>
          </Flex>
          <GpsTracker />
        </Paper>

        {/* Call to Action for Non-logged Users */}
        {!user && (
          <Paper
            p={{ base: "lg", md: 40 }}
            radius="lg"
            mb={{ base: 40, md: 60 }}
            style={{
              background: getBg(
                "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                `linear-gradient(135deg, ${theme.colors.dark[5]} 0%, ${theme.colors.dark[7]} 100%)`
              ),
              border: `1px solid ${getBg("rgba(47,128,237,0.2)", "rgba(47,128,237,0.5)")}`,
            }}
          >
            <Title order={2} mb="md" style={{ color: "#2f80ed" }}>
              Join our community today
            </Title>
            <Text mb="xl" c={getBg("dark", "gray.3")} size={{ base: "sm", md: "md" }}>
              Sign up now to report lost items, help others, and access advanced
              search features.
            </Text>
            <Grid gutter="lg">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="xs">
                  <Flex align="center" gap="xs">
                    <IconCheck size={16} color="green" />
                    <Text size="sm" c={getBg("dark", "gray.3")}>Report lost cars and people</Text>
                  </Flex>
                  <Flex align="center" gap="xs">
                    <IconCheck size={16} color="green" />
                    <Text size="sm" c={getBg("dark", "gray.3")}>Get real-time notifications</Text>
                  </Flex>
                  <Flex align="center" gap="xs">
                    <IconCheck size={16} color="green" />
                    <Text size="sm" c={getBg("dark", "gray.3")}>Help others in your community</Text>
                  </Flex>
                  <Flex align="center" gap="xs">
                    <IconCheck size={16} color="green" />
                    <Text size="sm" c={getBg("dark", "gray.3")}>Access advanced search tools</Text>
                  </Flex>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Flex
                  gap="md"
                  justify={{ base: "flex-start", md: "flex-end" }}
                  wrap={{ base: "wrap", md: "nowrap" }}
                >
                  <Button
                    variant="outline"
                    color="blue"
                    leftSection={<IconLogin size={18} />}
                    component={Link}
                    href="/login"
                    size={isMobile ? "sm" : "md"}
                    fullWidth={isMobile}
                  >
                    Login
                  </Button>
                  <Button
                    bg="blue.6"
                    size={isMobile ? "sm" : "md"}
                    radius="md"
                    rightSection={<IconArrowRight size={18} />}
                    component={Link}
                    href="/signup"
                    fullWidth={isMobile}
                    style={{
                      background: "linear-gradient(135deg, #2f80ed 0%, #1e56a0 100%)",
                    }}
                  >
                    SIGN UP FREE
                  </Button>
                </Flex>
              </Grid.Col>
            </Grid>
          </Paper>
        )}

        {/* Our Company Section */}
        <Box py={{ base: 40, md: 60 }}>
          <Title order={2} mb={{ base: 30, md: 50 }} ta="center" style={{ color: "#2f80ed" }}>
            Our Company
          </Title>
          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper
                shadow="md"
                p={0}
                radius="lg"
                withBorder
                h="100%"
                bg={getBg("white", theme.colors.dark[6])}
                style={{
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                  },
                }}
              >
                <Box
                  py="md"
                  px="lg"
                  style={{
                    borderBottom: `1px solid ${getBg(theme.colors.gray[2], theme.colors.dark[5])}`,
                    background: "linear-gradient(to right, #2f80ed, #1e56a0)",
                  }}
                >
                  <Flex align="center" gap="sm">
                    <IconTarget size={24} color="white" />
                    <Title order={3} c="white">
                      AIM
                    </Title>
                  </Flex>
                </Box>
                <Box
                  p="xl"
                  bg={getBg("blue.0", "blue.9")}
                  style={{
                    height: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text ta="center" c="dimmed">
                    Our mission to reunite people with their lost items
                  </Text>
                </Box>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper
                shadow="md"
                p={0}
                radius="lg"
                withBorder
                h="100%"
                bg={getBg("white", theme.colors.dark[6])}
                style={{
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                  },
                }}
              >
                <Box
                  py="md"
                  px="lg"
                  style={{
                    borderBottom: `1px solid ${getBg(theme.colors.gray[2], theme.colors.dark[5])}`,
                    background: "linear-gradient(to right, #2f80ed, #1e56a0)",
                  }}
                >
                  <Flex align="center" gap="sm">
                    <IconChartBar size={24} color="white" />
                    <Title order={3} c="white">
                      Vision
                    </Title>
                  </Flex>
                </Box>
                <Box
                  p="xl"
                  bg={getBg("blue.0", "blue.9")}
                  style={{
                    height: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text ta="center" c="dimmed">
                    Creating a world where nothing is ever truly lost
                  </Text>
                </Box>
              </Paper>
            </Grid.Col>
            <Grid.Col span={12}>
              <Paper
                shadow="md"
                p={0}
                radius="lg"
                withBorder
                maw={800}
                mx="auto"
                bg={getBg("white", theme.colors.dark[6])}
                style={{
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                  },
                }}
              >
                <Box
                  py="md"
                  px="lg"
                  style={{
                    borderBottom: `1px solid ${getBg(theme.colors.gray[2], theme.colors.dark[5])}`,
                    background: "linear-gradient(to right, #2f80ed, #1e56a0)",
                  }}
                >
                  <Flex align="center" gap="sm">
                    <IconGlobe size={24} color="white" />
                    <Title order={3} c="white">
                      Strategy
                    </Title>
                  </Flex>
                </Box>
                <Box
                  p="xl"
                  bg={getBg("blue.0", "blue.9")}
                  style={{
                    height: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text ta="center" c="dimmed">
                    Leveraging technology and community for faster recoveries
                  </Text>
                </Box>
              </Paper>
            </Grid.Col>
          </Grid>
        </Box>

        {/* Action Section */}
        <Box mt={{ base: 40, md: 60 }}>
          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Paper
                p={{ base: "lg", md: 40 }}
                radius="lg"
                h="100%"
                style={{
                  background: getBg(
                    "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                    `linear-gradient(135deg, ${theme.colors.dark[5]} 0%, ${theme.colors.dark[7]} 100%)`
                  ),
                  border: `1px solid ${getBg("rgba(47,128,237,0.2)", "rgba(47,128,237,0.5)")}`,
                }}
              >
                <Title order={2} mb="xl" style={{ color: "#2f80ed" }}>
                  {user
                    ? "Ready to help someone today?"
                    : "Want to help others?"}
                </Title>
                <Flex justify={{ base: "flex-start", md: "flex-end" }}>
                  <Button
                    component={Link}
                    href={user ? "/help" : "/signup"}
                    bg="blue.6"
                    size={isMobile ? "md" : "lg"}
                    radius="md"
                    rightSection={<IconArrowRight size={18} />}
                    fullWidth={isMobile}
                    style={{
                      background: "linear-gradient(135deg, #2f80ed 0%, #1e56a0 100%)",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        transition: "transform 0.2s",
                      },
                    }}
                  >
                    {user ? "HELP OTHERS" : "JOIN TO HELP"}
                  </Button>
                </Flex>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Paper
                p={30}
                radius="lg"
                h="100%"
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "linear-gradient(135deg, #2f80ed 0%, #1e56a0 100%)",
                }}
              >
                <Title
                  order={3}
                  size={{ base: 24, md: 28 }}
                  fw={700}
                  ta="center"
                  w="100%"
                  c="white"
                >
                  If you lost it we will find it
                </Title>
              </Paper>
            </Grid.Col>
          </Grid>
        </Box>

        {/* Enhanced Real Stories Section */}
        <Box py={{ base: 40, md: 60, lg: 80 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Title order={2} fw={800} mb={5} ta="center" style={{ color: "#2f80ed" }}>
              Real Stories, Real Results
            </Title>
            <Text size="sm" c="dimmed" mb={40} maw={600} mx="auto" ta="center">
              Hear from families and individuals who have successfully recovered
              their loved ones and vehicles through our advanced detection
              system
            </Text>
          </motion.div>

          {/* Reviews Carousel - fixed styles */}
          <Box px={{ base: 0, md: 20 }} mb={60}>
            <Carousel
              slideSize={{ base: "100%", sm: "50%", md: "33.333%" }}
              slideGap={{ base: "sm", md: "lg" }}
              align="start"
              loop
              withIndicators
              speed={300}
              styles={{
                indicator: {
                  width: 12,
                  height: 4,
                  transition: "width 250ms ease",
                  "&[dataActive]": {
                    width: 40,
                  },
                },
                controls: {
                  opacity: 0.7,
                },
              }}
            >
              {[
                {
                  id: 1,
                  name: "Sara Johnson",
                  role: "Found Car in 24 Hours",
                  avatarColor: "blue",
                  quote:
                    "I found my car within 24 hours of posting here. The AI detection is incredible!",
                  rating: 5,
                  date: "2 weeks ago",
                },
                {
                  id: 2,
                  name: "Kebede M.",
                  role: "Found Missing Brother",
                  avatarColor: "green",
                  quote:
                    "The alert system is so fast. Thank you for helping me find my brother.",
                  rating: 5,
                  date: "1 month ago",
                },
                {
                  id: 3,
                  name: "Michael Chen",
                  role: "Recovered Family Heirloom",
                  avatarColor: "orange",
                  quote:
                    "I thought I lost my grandmother's necklace forever. Community found it in 48 hours.",
                  rating: 5,
                  date: "3 weeks ago",
                },
                {
                  id: 4,
                  name: "Amina Hassan",
                  role: "Found Stolen Phone",
                  avatarColor: "pink",
                  quote:
                    "My phone was stolen. Using location tracking, police recovered it same day.",
                  rating: 5,
                  date: "1 week ago",
                },
                {
                  id: 5,
                  name: "David Wilson",
                  role: "Business Documents",
                  avatarColor: "grape",
                  quote:
                    "Left important contracts in a taxi. Driver found me through this platform.",
                  rating: 5,
                  date: "2 months ago",
                },
                {
                  id: 6,
                  name: "Maria Rodriguez",
                  role: "Pet Found After Storm",
                  avatarColor: "teal",
                  quote:
                    "Our dog ran away. Neighbors spotted him through the app.",
                  rating: 5,
                  date: "3 days ago",
                },
              ].map((review) => (
                <Carousel.Slide key={review.id}>
                  <Paper
                    p={{ base: "lg", md: "xl" }}
                    radius="lg"
                    withBorder
                    shadow="sm"
                    h="100%"
                    bg={getBg("white", theme.colors.dark[6])}
                    style={{
                      transition: "transform 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                      },
                    }}
                  >
                    <Box mb="md">
                      <Group gap={2} mb="xs">
                        {[...Array(review.rating)].map((_, i) => (
                          <IconStarFilled key={i} size={16} color="#FAB005" />
                        ))}
                      </Group>
                      <IconQuote
                        size={24}
                        color="var(--mantine-color-blue-3)"
                        style={{ opacity: 0.3, margin: "10px 0" }}
                      />
                      <Text
                        size="sm"
                        mb="md"
                        style={{ lineHeight: 1.6, fontStyle: "italic" }}
                      >
                        "{review.quote}"
                      </Text>
                    </Box>
                    <Group gap="sm" align="center">
                      <Avatar
                        size="md"
                        color={review.avatarColor}
                        radius="xl"
                        variant="filled"
                      >
                        {review.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </Avatar>
                      <Box style={{ flex: 1 }}>
                        <Text size="sm" fw={700}>
                          {review.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {review.role}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {review.date}
                        </Text>
                      </Box>
                    </Group>
                  </Paper>
                </Carousel.Slide>
              ))}
            </Carousel>
          </Box>

          {/* Stats Section */}
          <Grid gutter="lg" align="center" justify="center">
            <Grid.Col span={{ base: 6, sm: 3 }}>
              <Stack align="center" gap={5}>
                <Title order={1} c="blue.6" size={42}>
                  {missingPersons.length + missingVehicles.length}
                </Title>
                <Text size="sm" fw={700} ta="center">
                  Active Reports
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 3 }}>
              <Stack align="center" gap={5}>
                <Title order={1} c="blue.6" size={42}>
                  {missingPersons.length}
                </Title>
                <Text size="sm" fw={700} ta="center">
                  Missing People
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 3 }}>
              <Stack align="center" gap={5}>
                <Title order={1} c="blue.6" size={42}>
                  {missingVehicles.length}
                </Title>
                <Text size="sm" fw={700} ta="center">
                  Missing Vehicles
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 3 }}>
              <Stack align="center" gap={5}>
                <Title order={1} c="blue.6" size={42}>
                  {user ? userReports.filter(r => r.status === 'Resolved').length : '0'}
                </Title>
                <Text size="sm" fw={700} ta="center">
                  Your Resolved
                </Text>
              </Stack>
            </Grid.Col>
          </Grid>

          {/* Gallery Section */}
          <Box mt={40}>
            <Title order={3} size="h4" mb="lg" c="dimmed" ta="center">
              Success Stories Gallery
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
              {[
                {
                  img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=500",
                  title: "Family Reunion",
                  description: "Emotional reunions with loved ones",
                },
                {
                  img: "https://images.unsplash.com/photo-1543465077-db45d34b88a5?q=80&w=500",
                  title: "Car Recovery",
                  description: "Vehicles returned to owners",
                },
                {
                  img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=500",
                  title: "Happy Moments",
                  description: "Joyful recovery stories",
                },
              ].map((item, idx) => (
                <Paper
                  key={idx}
                  radius="md"
                  style={{
                    overflow: "hidden",
                    position: "relative",
                    aspectRatio: "16/9",
                    transition: "transform 0.3s",
                    "&:hover": {
                      transform: "scale(1.02)",
                    },
                  }}
                >
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <Box
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background:
                        "linear-gradient(transparent, rgba(0,0,0,0.7))",
                      padding: "12px",
                    }}
                  >
                    <Text size="sm" c="white" fw={600}>
                      {item.title}
                    </Text>
                    <Text size="xs" c="white">
                      {item.description}
                    </Text>
                  </Box>
                </Paper>
              ))}
            </SimpleGrid>
          </Box>
        </Box>

        {/* Final Call to Action */}
        {!user && (
          <Box py={{ base: 40, md: 60 }}>
            <Paper
              shadow="lg"
              p={{ base: "lg", md: 50 }}
              radius="lg"
              bg="linear-gradient(135deg, #2f80ed 0%, #1e56a0 100%)"
              ta="center"
              style={{
                boxShadow: "0 20px 60px rgba(47, 128, 237, 0.3)",
              }}
            >
              <Title order={2} c="white" mb="md">
                Ready to get started?
              </Title>
              <Text
                size={{ base: "md", md: "lg" }}
                c="white"
                mb="xl"
                maw={600}
                mx="auto"
                style={{ opacity: 0.9 }}
              >
                Join thousands of users who have successfully found their lost
                items and helped others in the community.
              </Text>
              <Flex
                gap="md"
                justify="center"
                direction={{ base: "column", sm: "row" }}
                align="center"
              >
                <Button
                  size={isMobile ? "md" : "xl"}
                  variant="white"
                  color="blue"
                  radius="xl"
                  leftSection={<IconLogin size={20} />}
                  component={Link}
                  href="/login"
                  fullWidth={isMobile}
                >
                  Login
                </Button>
                <Button
                  size={isMobile ? "md" : "xl"}
                  bg="black"
                  color="white"
                  radius="xl"
                  rightSection={<IconArrowRight size={20} />}
                  component={Link}
                  href="/signup"
                  fullWidth={isMobile}
                  style={{
                    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                  }}
                >
                  Create Free Account
                </Button>
              </Flex>
            </Paper>
          </Box>
        )}
      </Container>

      <MainFooter />
    </Box>
  );
}