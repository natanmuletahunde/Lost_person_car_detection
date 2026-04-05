"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Title, Text, Paper, SimpleGrid, Group, Button,
  Table, Badge, ActionIcon, Tooltip, Select, TextInput,
  Modal, Stack, Grid, Divider, Avatar, Pagination,
  Menu, UnstyledButton, Textarea, Alert, Chip,
  ThemeIcon, Loader, Checkbox, Timeline, Progress,
  Image, Card, Flex, Stepper, Radio, Tabs, ScrollArea,
  useMantineTheme, useMantineColorScheme
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  IconFileCheck, IconFileAlert, IconFileDescription,
  IconDownload, IconEdit, IconTrash,
  IconEye, IconDotsVertical, IconCheck, IconX,
  IconSearch, IconSettings, IconSend,
  IconClock, IconCalendar, IconUsers, IconUser,
  IconCopy, IconSend2, IconDeviceFloppy,
  IconAlertCircle, IconFile, IconPhoto,
  IconId, IconCar, IconLicense, IconFileText,
  IconFilter, IconRefresh, IconArrowRight,
  IconArrowLeft, IconCheckbox, IconBrandTelegram,
  IconMapPin, IconHash, IconRoad, IconSteeringWheel,
  IconShieldCheck, IconXCircle
} from '@tabler/icons-react';
import Link from 'next/link';

dayjs.extend(relativeTime);

// Helper to get dynamic background/color values
const getBg = (colorScheme, light, dark) => (colorScheme === 'dark' ? dark : light);
const getTextColor = (colorScheme, light, dark) => (colorScheme === 'dark' ? dark : light);

// ---------- DOCUMENT TYPES ----------
const DOCUMENT_TYPES = [
  { value: 'vehicle_registration', label: 'Vehicle Registration', icon: IconCar, color: 'orange' },
  { value: 'insurance', label: 'Insurance Certificate', icon: IconShieldCheck, color: 'green' },
  { value: 'id_card', label: 'Owner ID Card', icon: IconId, color: 'blue' },
  { value: 'passport', label: 'Owner Passport', icon: IconLicense, color: 'indigo' },
  { value: 'drivers_license', label: "Owner's Driver License", icon: IconSteeringWheel, color: 'yellow' },
  { value: 'logbook', label: 'Vehicle Logbook', icon: IconFileText, color: 'violet' },
  { value: 'other', label: 'Other Document', icon: IconFile, color: 'gray' },
];

// ---------- MOCK DATA ----------
const INITIAL_DOCUMENTS = [
  {
    id: 1,
    userId: 101,
    userName: 'John Smith',
    userEmail: 'john.smith@gmail.com',
    userPhone: '+251-911-234567',
    documentType: 'vehicle_registration',
    documentName: 'Toyota Corolla Registration - Front',
    fileName: 'toyota_registration_001.jpg',
    fileSize: '2.1 MB',
    fileUrl: '/mock-images/toyota_registration.jpg',
    vehicleMake: 'Toyota',
    vehicleModel: 'Corolla',
    vehicleYear: '2023',
    vehiclePlate: 'ET 01 ABC 123',
    vehicleVin: 'JTDB4MEE6NJ123456',
    uploadDate: '2026-02-15T09:30:00',
    status: 'pending',
    reviewedBy: null,
    reviewDate: null,
    rejectionReason: null,
    notes: 'Verify plate number ET 01 ABC 123 matches owner ID',
    priority: 'high',
    ownershipMatch: null,
  },
  {
    id: 2,
    userId: 102,
    userName: 'Olivia Bennett',
    userEmail: 'ollyben@gmail.com',
    userPhone: '+251-912-345678',
    documentType: 'insurance',
    documentName: 'Hyundai Tucson Insurance',
    fileName: 'hyundai_insurance.pdf',
    fileSize: '1.8 MB',
    fileUrl: null,
    vehicleMake: 'Hyundai',
    vehicleModel: 'Tucson',
    vehicleYear: '2022',
    vehiclePlate: 'ET 02 DEF 456',
    vehicleVin: 'KMHCT4AE9NU789012',
    uploadDate: '2026-02-14T14:20:00',
    status: 'pending',
    priority: 'normal',
    notes: 'Check if insurance covers current owner',
  },
  {
    id: 3,
    userId: 103,
    userName: 'Abebe Kebede',
    userEmail: 'abebe.k@etmail.com',
    userPhone: '+251-913-456789',
    documentType: 'id_card',
    documentName: 'Owner ID Card',
    fileName: 'id_card_abebe.jpg',
    fileSize: '1.5 MB',
    fileUrl: '/mock-images/id_card.jpg',
    vehicleMake: 'Isuzu',
    vehicleModel: 'D-Max',
    vehicleYear: '2021',
    vehiclePlate: 'ET 03 GHI 789',
    vehicleVin: 'MAZDAFJD123456789',
    uploadDate: '2026-02-13T11:10:00',
    status: 'pending',
    priority: 'high',
    notes: 'Match ID with vehicle registration owner name',
  },
  {
    id: 4,
    userId: 104,
    userName: 'Fatima Ali',
    userEmail: 'fatima.ali@gmail.com',
    userPhone: '+251-914-567890',
    documentType: 'logbook',
    documentName: 'Vehicle Logbook',
    fileName: 'logbook_fatima.pdf',
    fileSize: '3.2 MB',
    fileUrl: null,
    vehicleMake: 'Honda',
    vehicleModel: 'CR-V',
    vehicleYear: '2024',
    vehiclePlate: 'ET 04 JKL 012',
    vehicleVin: '2HKRM4H3XRH567890',
    uploadDate: '2026-02-12T16:45:00',
    status: 'approved',
    reviewedBy: 'admin@example.com',
    reviewDate: '2026-02-13T10:30:00',
    priority: 'normal',
    ownershipMatch: 'confirmed',
  },
];

// ---------- HELPER FUNCTIONS ----------
const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  return dayjs(dateString).format('MMM D, YYYY · h:mm A');
};

const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  return dayjs(dateString).fromNow();
};

const getStatusColor = (status) => {
  switch (status) {
    case 'approved': return 'green';
    case 'rejected': return 'red';
    case 'pending': return 'yellow';
    default: return 'gray';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'approved': return IconCheck;
    case 'rejected': return IconX;
    case 'pending': return IconClock;
    default: return IconFileDescription;
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return 'red';
    case 'normal': return 'blue';
    case 'low': return 'gray';
    default: return 'gray';
  }
};

const getDocumentTypeDetails = (type) => {
  return DOCUMENT_TYPES.find(dt => dt.value === type) || { label: type, icon: IconFile, color: 'gray' };
};

// ---------- MAIN COMPONENT ----------
export default function CarOwnershipValidationPage() {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  // Dynamic colors
  const mainBg = getBg(colorScheme, '#F4F7FE', theme.colors.dark[7]);
  const headerBg = getBg(colorScheme, 'white', theme.colors.dark[6]);
  const footerBg = getBg(colorScheme, 'white', theme.colors.dark[6]);
  const primaryText = getTextColor(colorScheme, '#2B3674', theme.colors.gray[3]);

  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [activePage, setActivePage] = useState(1);
  const [pageSize, setPageSize] = useState('10');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [viewingDocument, setViewingDocument] = useState(null);
  
  const [validationStep, setValidationStep] = useState(0);

  const [viewModalOpened, viewModalHandlers] = useDisclosure(false);
  const [validationModalOpened, validationModalHandlers] = useDisclosure(false);
  const [deleteModalOpened, deleteModalHandlers] = useDisclosure(false);

  // ---------- STATS ----------
  const stats = useMemo(() => {
    const total = documents.length;
    const pending = documents.filter(d => d.status === 'pending').length;
    const approved = documents.filter(d => d.status === 'approved').length;
    const rejected = documents.filter(d => d.status === 'rejected').length;
    const highPriority = documents.filter(d => d.priority === 'high' && d.status === 'pending').length;
    const today = dayjs().format('YYYY-MM-DD');
    const uploadedToday = documents.filter(d => dayjs(d.uploadDate).isSame(today, 'day')).length;
    return { total, pending, approved, rejected, highPriority, uploadedToday };
  }, [documents]);

  // ---------- FILTERED DOCUMENTS ----------
  const filteredDocuments = useMemo(() => {
    let result = [...documents];
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.userName.toLowerCase().includes(lower) ||
        d.userEmail.toLowerCase().includes(lower) ||
        d.vehiclePlate.toLowerCase().includes(lower) ||
        d.documentName.toLowerCase().includes(lower) ||
        d.vehicleMake?.toLowerCase().includes(lower)
      );
    }
    if (statusFilter && statusFilter !== 'All') {
      result = result.filter(d => d.status === statusFilter);
    }
    if (typeFilter && typeFilter !== 'All') {
      result = result.filter(d => d.documentType === typeFilter);
    }
    if (priorityFilter && priorityFilter !== 'All') {
      result = result.filter(d => d.priority === priorityFilter);
    }
    if (dateRange.start) {
      result = result.filter(d => dayjs(d.uploadDate).isAfter(dateRange.start));
    }
    if (dateRange.end) {
      result = result.filter(d => dayjs(d.uploadDate).isBefore(dayjs(dateRange.end).add(1, 'day')));
    }
    result.sort((a, b) => dayjs(b.uploadDate).unix() - dayjs(a.uploadDate).unix());
    return result;
  }, [documents, searchQuery, statusFilter, typeFilter, priorityFilter, dateRange]);

  const paginatedDocuments = useMemo(() => {
    const size = parseInt(pageSize);
    const start = (activePage - 1) * size;
    return filteredDocuments.slice(start, start + size);
  }, [filteredDocuments, activePage, pageSize]);

  const totalPages = useMemo(() => Math.ceil(filteredDocuments.length / parseInt(pageSize)), [filteredDocuments, pageSize]);

  useEffect(() => {
    setActivePage(1);
  }, [searchQuery, statusFilter, typeFilter, priorityFilter, dateRange, pageSize]);

  // ---------- FIXED VALIDATION FORM ----------
  const validationForm = useForm({
    initialValues: {
      decision: '',
      ownershipMatch: '',
      rejectionReason: '',
      internalNotes: '',
      verifiedPlate: '',
      verifiedVin: '',
    },
    validate: {
      ownershipMatch: (value) => !value ? 'Please select ownership verification status' : null,
      decision: (value) => !value ? 'Please select approve or reject' : null,
      rejectionReason: (value, values) => 
        values.decision === 'reject' && !value ? 'Rejection reason is required' : null,
      verifiedPlate: (value, values) => 
        (values.decision === 'approve' || values.ownershipMatch) && !value 
          ? 'Verified plate number is required' : null,
    },
  });

  // ---------- ACTIONS ----------
  const startValidation = (document) => {
    setSelectedDocument(document);
    setValidationStep(0);
    validationForm.reset();
    validationModalHandlers.open();
  };

  const submitValidation = (values) => {
    if (!selectedDocument) return;
    
    const isApproved = values.decision === 'approve';
    setDocuments(prev => prev.map(d =>
      d.id === selectedDocument.id
        ? {
            ...d,
            status: isApproved ? 'approved' : 'rejected',
            ownershipMatch: values.ownershipMatch,
            reviewedBy: 'admin@example.com',
            reviewDate: new Date().toISOString(),
            rejectionReason: isApproved ? null : values.rejectionReason,
            notes: values.internalNotes || d.notes,
          }
        : d
    ));
    
    notifications.show({
      title: isApproved ? '✅ Ownership Verified' : '❌ Ownership Rejected',
      message: `Vehicle ${selectedDocument.vehiclePlate} for ${selectedDocument.userName} has been ${isApproved ? 'verified' : 'rejected'}.`,
      color: isApproved ? 'green' : 'red',
      icon: isApproved ? <IconCheck size={18} /> : <IconX size={18} />,
    });
    
    validationModalHandlers.close();
    setSelectedDocument(null);
  };

  const deleteDocument = () => {
    if (!selectedDocument) return;
    setDocuments(prev => prev.filter(d => d.id !== selectedDocument.id));
    notifications.show({
      title: '🗑️ Documents Deleted',
      message: `Vehicle documents for ${selectedDocument.vehiclePlate} removed.`,
      color: 'red',
      icon: <IconTrash size={18} />
    });
    deleteModalHandlers.close();
    setSelectedDocument(null);
  };

  const exportToCSV = () => {
    const headers = [
      'ID', 'User', 'Email', 'Phone', 'Vehicle Make', 'Vehicle Model', 
      'Plate Number', 'Document Type', 'Document Name', 'Status', 
      'Priority', 'Upload Date', 'Reviewer', 'Review Date', 'Ownership Match'
    ];
    const rows = filteredDocuments.map(d => [
      d.id,
      `"${d.userName}"`,
      `"${d.userEmail}"`,
      d.userPhone || '',
      d.vehicleMake || '',
      d.vehicleModel || '',
      d.vehiclePlate || '',
      getDocumentTypeDetails(d.documentType).label,
      `"${d.documentName}"`,
      d.status,
      d.priority,
      dayjs(d.uploadDate).format('YYYY-MM-DD HH:mm'),
      d.reviewedBy || '',
      d.reviewDate ? dayjs(d.reviewDate).format('YYYY-MM-DD HH:mm') : '',
      d.ownershipMatch || '',
    ]);
    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `car_ownership_${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    notifications.show({
      title: '📊 Exported',
      message: `${filteredDocuments.length} vehicle records exported`,
      color: 'green',
      icon: <IconDownload size={18} />
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter(null);
    setTypeFilter(null);
    setPriorityFilter(null);
    setDateRange({ start: null, end: null });
  };

  // ---------- FIXED STEP CONTROL ----------
  const nextStep = () => {
    const errors = validationForm.validate();
    if (Object.keys(errors).length > 0) {
      notifications.show({
        title: '⚠️ Please fix errors',
        message: 'Complete all required fields before continuing.',
        color: 'yellow',
      });
      return;
    }
    setValidationStep((s) => s + 1);
  };

  const prevStep = () => setValidationStep((s) => Math.max(0, s - 1));

  return (
    <Box bg={mainBg} style={{ minHeight: '100vh' }} p="xl">
      {/* HEADER */}
      <Group justify="space-between" mb="xl">
        <Box>
          <Title order={2} fw={700} c={primaryText}>
            Car Ownership Validation
          </Title>
          <Text size="sm" c="dimmed">Verify vehicle ownership documents from users</Text>
        </Box>
        <Group bg={headerBg} p={8} style={{ borderRadius: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Tooltip label="Settings">
            <ActionIcon variant="subtle" color="gray"><IconSettings size={20} /></ActionIcon>
          </Tooltip>
          <Tooltip label="Pending Alerts">
            <ActionIcon variant="subtle" color="orange"><IconFileAlert size={20} /></ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* STATS */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mb="xl">
        <Paper p="md" radius="lg" bg="linear-gradient(145deg, #4318FF, #7B61FF)" c="white" shadow="md">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text size="xl" fw={800} style={{ fontSize: '32px' }}>{stats.pending}</Text>
              <Text size="sm" fw={500}>Pending Verification</Text>
              {stats.highPriority > 0 && (
                <Badge color="red" variant="filled" size="sm" mt="xs">
                  {stats.highPriority} high priority
                </Badge>
              )}
            </Box>
            <IconClock size={48} opacity={0.3} />
          </Group>
          <UnstyledButton
            w="100%"
            py={8}
            mt="md"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
            onClick={() => { setStatusFilter('pending'); notifications.show({ message: 'Showing pending vehicle verifications', color: 'blue' }); }}
          >
            <Text size="xs" fw={600}>Review now →</Text>
          </UnstyledButton>
        </Paper>

        <Paper p="md" radius="lg" bg="linear-gradient(145deg, #20C997, #3BD6A4)" c="white" shadow="md">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text size="xl" fw={800} style={{ fontSize: '32px' }}>{stats.approved}</Text>
              <Text size="sm" fw={500}>Ownership Verified</Text>
            </Box>
            <IconCheck size={48} opacity={0.3} />
          </Group>
          <UnstyledButton
            w="100%"
            py={8}
            mt="md"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
            onClick={() => { setStatusFilter('approved'); notifications.show({ message: 'Showing verified ownerships', color: 'blue' }); }}
          >
            <Text size="xs" fw={600}>View →</Text>
          </UnstyledButton>
        </Paper>

        <Paper p="md" radius="lg" bg="linear-gradient(145deg, #F59E0B, #FBBF24)" c="white" shadow="md">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text size="xl" fw={800} style={{ fontSize: '32px' }}>{stats.rejected}</Text>
              <Text size="sm" fw={500}>Ownership Rejected</Text>
            </Box>
            <IconX size={48} opacity={0.3} />
          </Group>
          <UnstyledButton
            w="100%"
            py={8}
            mt="md"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
            onClick={() => { setStatusFilter('rejected'); notifications.show({ message: 'Showing rejected ownerships', color: 'blue' }); }}
          >
            <Text size="xs" fw={600}>View →</Text>
          </UnstyledButton>
        </Paper>

        <Paper p="md" radius="lg" bg="linear-gradient(145deg, #00B8D9, #00C7E6)" c="white" shadow="md">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text size="xl" fw={800} style={{ fontSize: '32px' }}>{stats.total}</Text>
              <Text size="sm" fw={500}>Total Vehicles</Text>
              <Text size="xs" mt="xs" opacity={0.9}>{stats.uploadedToday} verified today</Text>
            </Box>
            <IconCar size={48} opacity={0.3} />
          </Group>
          <UnstyledButton
            w="100%"
            py={8}
            mt="md"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
            onClick={() => { clearFilters(); notifications.show({ message: 'Showing all vehicle documents', color: 'blue' }); }}
          >
            <Text size="xs" fw={600}>View all →</Text>
          </UnstyledButton>
        </Paper>
      </SimpleGrid>

      {/* FILTERS */}
      <Paper p="md" radius="lg" mb="xl" shadow="xs" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Group>
              <TextInput
                placeholder="Search user, plate, or vehicle"
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                radius="md"
                size="sm"
                w={240}
              />
              <Select
                placeholder="Status"
                data={['All', 'pending', 'approved', 'rejected']}
                value={statusFilter}
                onChange={setStatusFilter}
                clearable
                radius="md"
                size="sm"
                w={130}
              />
              <Select
                placeholder="Document Type"
                data={['All', ...DOCUMENT_TYPES.map(t => t.value)]}
                value={typeFilter}
                onChange={setTypeFilter}
                clearable
                radius="md"
                size="sm"
                w={160}
              />
              <Select
                placeholder="Priority"
                data={['All', 'high', 'normal', 'low']}
                value={priorityFilter}
                onChange={setPriorityFilter}
                clearable
                radius="md"
                size="sm"
                w={130}
              />
              {(searchQuery || statusFilter || typeFilter || priorityFilter || dateRange.start || dateRange.end) && (
                <Button variant="subtle" color="gray" leftSection={<IconRefresh size={16} />} onClick={clearFilters} size="sm" radius="md">
                  Clear
                </Button>
              )}
            </Group>
            <Group>
              <Button
                variant="outline"
                color="gray"
                leftSection={<IconDownload size={16} />}
                onClick={exportToCSV}
                radius="md"
                size="sm"
              >
                Export CSV
              </Button>
            </Group>
          </Group>
        </Stack>
      </Paper>

      {/* TABLE */}
      <Paper radius="lg" shadow="sm" withBorder style={{ overflow: 'hidden' }}>
        <Table.ScrollContainer minWidth={1400}>
          <Table verticalSpacing="md" highlightOnHover striped>
            <Table.Thead bg="#4318FF">
              <Table.Tr>
                <Table.Th c="white">User</Table.Th>
                <Table.Th c="white">Vehicle</Table.Th>
                <Table.Th c="white">Plate</Table.Th>
                <Table.Th c="white">Document</Table.Th>
                <Table.Th c="white">Type</Table.Th>
                <Table.Th c="white">Status</Table.Th>
                <Table.Th c="white">Priority</Table.Th>
                <Table.Th c="white">Uploaded</Table.Th>
                <Table.Th c="white">Reviewed</Table.Th>
                <Table.Th c="white" style={{ width: 140 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginatedDocuments.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={10}>
                    <Text ta="center" py="xl" c="dimmed">No vehicle documents found</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                paginatedDocuments.map((doc) => {
                  const typeDetails = getDocumentTypeDetails(doc.documentType);
                  const StatusIcon = getStatusIcon(doc.status);
                  const IconComponent = typeDetails.icon;
                  return (
                    <Table.Tr key={doc.id}>
                      <Table.Td>
                        <Group gap="sm">
                          <Avatar size="sm" color="blue" radius="xl">
                            {doc.userName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Text size="sm" fw={500}>{doc.userName}</Text>
                            <Text size="xs" c="dimmed">{doc.userEmail}</Text>
                          </Box>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Box>
                          <Text size="sm" fw={500}>{doc.vehicleMake} {doc.vehicleModel}</Text>
                          <Text size="xs" c="dimmed">{doc.vehicleYear}</Text>
                        </Box>
                      </Table.Td>
                      <Table.Td>
                        <Badge color="orange" variant="light" size="lg">
                          {doc.vehiclePlate}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Box>
                          <Text size="sm" fw={500}>{doc.documentName}</Text>
                          <Text size="xs" c="dimmed">{doc.fileName} • {doc.fileSize}</Text>
                        </Box>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ThemeIcon size="sm" variant="light" color={typeDetails.color} radius="xl">
                            <IconComponent size={14} />
                          </ThemeIcon>
                          <Text size="sm">{typeDetails.label}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={getStatusColor(doc.status)}
                          variant="light"
                          radius="xl"
                          leftSection={<StatusIcon size={12} />}
                        >
                          {doc.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getPriorityColor(doc.priority)} variant="outline" radius="xl">
                          {doc.priority}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Tooltip label={formatDateTime(doc.uploadDate)}>
                          <Text size="sm" style={{ cursor: 'help' }}>
                            {getRelativeTime(doc.uploadDate)}
                          </Text>
                        </Tooltip>
                      </Table.Td>
                      <Table.Td>
                        {doc.reviewDate ? (
                          <Tooltip label={formatDateTime(doc.reviewDate)}>
                            <Text size="sm" style={{ cursor: 'help' }}>
                              {getRelativeTime(doc.reviewDate)}
                            </Text>
                          </Tooltip>
                        ) : '—'}
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4} justify="flex-end">
                          <Tooltip label="View details">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => {
                                setViewingDocument(doc);
                                viewModalHandlers.open();
                              }}
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                          </Tooltip>
                          
                          {doc.status === 'pending' && (
                            <Tooltip label="Validate ownership">
                              <ActionIcon
                                variant="filled"
                                color="blue"
                                onClick={() => startValidation(doc)}
                              >
                                <IconCheckbox size={16} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                          
                          <Menu shadow="md" width={160} position="bottom-end">
                            <Menu.Target>
                              <ActionIcon variant="subtle" color="gray">
                                <IconDotsVertical size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                color="red"
                                leftSection={<IconTrash size={14} />}
                                onClick={() => {
                                  setSelectedDocument(doc);
                                  deleteModalHandlers.open();
                                }}
                              >
                                Delete
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        {/* PAGINATION */}
        <Group justify="space-between" p="md" bg={footerBg}>
          <Group gap="xs">
            <Text size="sm" c="dimmed">Rows per page</Text>
            <Select
              size="xs"
              w={70}
              data={['5', '10', '20', '50']}
              value={pageSize}
              onChange={(val) => setPageSize(val || '10')}
              radius="md"
            />
            <Text size="sm" c="dimmed">
              {filteredDocuments.length} {filteredDocuments.length === 1 ? 'vehicle' : 'vehicles'}
            </Text>
          </Group>
          <Pagination
            total={totalPages}
            value={activePage}
            onChange={setActivePage}
            size="sm"
            radius="xl"
            color="blue"
          />
        </Group>
      </Paper>

      {/* VIEW MODAL */}
      <Modal
        opened={viewModalOpened}
        onClose={viewModalHandlers.close}
        title={<Text fw={700} size="lg">Vehicle Document Details</Text>}
        centered
        size="xl"
        radius="md"
      >
        {viewingDocument && (
          <Stack gap="lg">
            <Group justify="space-between">
              <Group>
                <Avatar size="lg" color="blue" radius="xl">
                  {viewingDocument.userName.charAt(0)}
                </Avatar>
                <Box>
                  <Text fw={700} size="lg">{viewingDocument.userName}</Text>
                  <Text size="sm" c="dimmed">{viewingDocument.userEmail}</Text>
                  {viewingDocument.userPhone && (
                    <Text size="xs" c="dimmed">{viewingDocument.userPhone}</Text>
                  )}
                </Box>
              </Group>
              <Group>
                <Badge color="orange" size="lg">{viewingDocument.vehiclePlate}</Badge>
                <Badge color={getStatusColor(viewingDocument.status)} size="lg" radius="xl">
                  {viewingDocument.status}
                </Badge>
              </Group>
            </Group>

            <Tabs defaultValue="vehicle">
              <Tabs.List>
                <Tabs.Tab value="vehicle" leftSection={<IconCar size={16} />}>
                  Vehicle Info
                </Tabs.Tab>
                <Tabs.Tab value="document" leftSection={<IconFileDescription size={16} />}>
                  Document
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="vehicle" mt="md">
                <Paper p="md" withBorder radius="md" bg={getBg(colorScheme, 'gray.0', theme.colors.dark[6])}>
                  <Grid>
                    <Grid.Col span={6}>
                      <Text size="sm" c="dimmed">Make</Text>
                      <Text fw={500}>{viewingDocument.vehicleMake}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm" c="dimmed">Model</Text>
                      <Text fw={500}>{viewingDocument.vehicleModel}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm" c="dimmed">Year</Text>
                      <Text fw={500}>{viewingDocument.vehicleYear}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm" c="dimmed">VIN</Text>
                      <Text fw={500}>{viewingDocument.vehicleVin}</Text>
                    </Grid.Col>
                  </Grid>
                </Paper>
              </Tabs.Panel>

              <Tabs.Panel value="document" mt="md">
                <Paper p="md" withBorder radius="md" bg={getBg(colorScheme, 'gray.0', theme.colors.dark[6])}>
                  <Text size="sm" c="dimmed">Document Preview</Text>
                  {viewingDocument.fileUrl ? (
                    <Image
                      src={viewingDocument.fileUrl}
                      height={300}
                      fit="contain"
                      radius="md"
                      mt="md"
                      withPlaceholder
                      placeholder={<IconPhoto size={48} />}
                    />
                  ) : (
                    <Paper p="xl" style={{ textAlign: 'center', minHeight: '300px', mt: 'md' }}>
                      <IconFile size={48} color="gray" opacity={0.5} />
                      <Text mt="sm" c="dimmed">Preview not available</Text>
                      <Text size="xs" c="dimmed">{viewingDocument.fileName} ({viewingDocument.fileSize})</Text>
                    </Paper>
                  )}
                </Paper>
              </Tabs.Panel>
            </Tabs>

            <Divider />
            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Document Type</Text>
                <Text fw={500}>{getDocumentTypeDetails(viewingDocument.documentType).label}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Uploaded</Text>
                <Text>{formatDateTime(viewingDocument.uploadDate)}</Text>
              </Grid.Col>
              {viewingDocument.notes && (
                <Grid.Col span={12}>
                  <Text size="sm" c="dimmed">Admin Notes</Text>
                  <Paper p="xs" bg="yellow.0" radius="md">
                    <Text size="sm">{viewingDocument.notes}</Text>
                  </Paper>
                </Grid.Col>
              )}
            </Grid>

            <Group justify="flex-end" gap="sm">
              {viewingDocument.status === 'pending' && (
                <Button
                  variant="light"
                  color="blue"
                  leftSection={<IconCheckbox size={16} />}
                  onClick={() => {
                    viewModalHandlers.close();
                    startValidation(viewingDocument);
                  }}
                >
                  Validate Ownership
                </Button>
              )}
              <Button variant="subtle" onClick={viewModalHandlers.close}>Close</Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* FIXED VALIDATION MODAL */}
      <Modal
        opened={validationModalOpened}
        onClose={validationModalHandlers.close}
        title={<Text fw={700} size="lg">Verify Car Ownership</Text>}
        centered
        size="xl"
        radius="md"
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        {selectedDocument && (
          <form onSubmit={validationForm.onSubmit(submitValidation)}>
            <Stack gap="lg">
              <Stepper active={validationStep} size="sm" allowNextStepsSelect={false}>
                <Stepper.Step label="Vehicle Info" description="Check details" />
                <Stepper.Step label="Ownership Check" description="Verify match" />
                <Stepper.Step label="Decision" description="Final action" />
              </Stepper>

              {validationStep === 0 && (
                <Stack gap="md">
                  <Group align="flex-start">
                    <Avatar size="lg" color="blue" radius="xl">
                      {selectedDocument.userName.charAt(0)}
                    </Avatar>
                    <Box style={{ flex: 1 }}>
                      <Text fw={600} size="lg">{selectedDocument.userName}</Text>
                      <Text size="sm" c="dimmed">{selectedDocument.userEmail}</Text>
                      <Badge color="orange" size="lg" mt={4}>{selectedDocument.vehiclePlate}</Badge>
                    </Box>
                  </Group>

                  <Paper p="md" withBorder radius="md" bg={getBg(colorScheme, 'gray.0', theme.colors.dark[6])}>
                    <Grid gutter="md">
                      <Grid.Col span={6}>
                        <Text size="sm" c="dimmed">Vehicle</Text>
                        <Text fw={500}>{selectedDocument.vehicleMake} {selectedDocument.vehicleModel} ({selectedDocument.vehicleYear})</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="sm" c="dimmed">Plate Number</Text>
                        <TextInput
                          value={selectedDocument.vehiclePlate}
                          readOnly
                          styles={{ input: { fontWeight: 600, color: 'var(--mantine-color-orange-7)' } }}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="sm" c="dimmed">VIN</Text>
                        <Text fw={500}>{selectedDocument.vehicleVin}</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="sm" c="dimmed">Document</Text>
                        <Text fw={500}>{getDocumentTypeDetails(selectedDocument.documentType).label}</Text>
                      </Grid.Col>
                    </Grid>
                  </Paper>

                  {selectedDocument.fileUrl && (
                    <Paper p="sm" withBorder radius="md" bg={getBg(colorScheme, 'gray.0', theme.colors.dark[6])}>
                      <Text size="sm" c="dimmed" mb="sm">Document Preview</Text>
                      <Image
                        src={selectedDocument.fileUrl}
                        height={200}
                        fit="contain"
                        radius="md"
                        withPlaceholder
                      />
                    </Paper>
                  )}
                </Stack>
              )}

              {validationStep === 1 && (
                <Stack gap="md">
                  <Alert color="blue" icon={<IconShieldCheck size={18} />}>
                    Does <strong>{selectedDocument.userName}</strong> own vehicle <strong>{selectedDocument.vehiclePlate}</strong>?
                  </Alert>

                  <Radio.Group
                    label="Ownership Verification Status"
                    description="Select one option"
                    {...validationForm.getInputProps('ownershipMatch')}
                    required
                    error={validationForm.errors.ownershipMatch}
                  >
                    <Stack mt="xs">
                      <Radio 
                        value="confirmed" 
                        label={
                          <Box>
                            <Text fw={500}>✅ Ownership Confirmed</Text>
                            <Text size="sm" c="dimmed">Name matches, plate verified, valid docs</Text>
                          </Box>
                        }
                        color="green"
                      />
                      <Radio 
                        value="partial" 
                        label={
                          <Box>
                            <Text fw={500}>⚠️ Partial Match</Text>
                            <Text size="sm" c="dimmed">Some details match, needs review</Text>
                          </Box>
                        }
                        color="yellow"
                      />
                      <Radio 
                        value="not_match" 
                        label={
                          <Box>
                            <Text fw={500}>❌ Does Not Match</Text>
                            <Text size="sm" c="dimmed">Name/plate/document issues</Text>
                          </Box>
                        }
                        color="red"
                      />
                    </Stack>
                  </Radio.Group>

                  <Divider />

                  <TextInput
                    label="Confirmed Plate Number *"
                    placeholder="ET 01 ABC 123"
                    {...validationForm.getInputProps('verifiedPlate')}
                    required
                    error={validationForm.errors.verifiedPlate}
                  />

                  <TextInput
                    label="Confirmed VIN (optional)"
                    placeholder="JTDB4MEE6NJ123456"
                    {...validationForm.getInputProps('verifiedVin')}
                  />
                </Stack>
              )}

              {validationStep === 2 && (
                <Stack gap="md">
                  <Alert 
                    color={validationForm.values.decision === 'approve' ? 'green' : 'red'} 
                    title={`Ownership ${validationForm.values.decision || 'Decision'}`}
                    icon={
                      validationForm.values.decision === 'approve' ? <IconCheck size={18} /> : <IconX size={18} />
                    }
                  >
                    <Text size="sm">
                      Vehicle: <strong>{selectedDocument.vehicleMake} {selectedDocument.vehicleModel}</strong><br/>
                      Plate: <strong>{selectedDocument.vehiclePlate}</strong><br/>
                      Owner: <strong>{selectedDocument.userName}</strong><br/><br/>
                      Verification: <strong>
                        {validationForm.values.ownershipMatch === 'confirmed' ? '✅ Confirmed' : 
                         validationForm.values.ownershipMatch === 'partial' ? '⚠️ Partial' : '❌ Not Match'}
                      </strong>
                    </Text>
                  </Alert>

                  <Radio.Group
                    label="Final Decision"
                    description="Approve or reject ownership verification"
                    {...validationForm.getInputProps('decision')}
                    required
                    error={validationForm.errors.decision}
                  >
                    <Group mt="xs">
                      <Radio value="approve" label="✅ Approve Ownership" color="green" />
                      <Radio value="reject" label="❌ Reject Ownership" color="red" />
                    </Group>
                  </Radio.Group>

                  {validationForm.values.decision === 'reject' && (
                    <Textarea
                      label="Rejection Reason *"
                      description="Required - shown to user"
                      placeholder="e.g. Name mismatch, expired docs, poor quality..."
                      {...validationForm.getInputProps('rejectionReason')}
                      required
                      error={validationForm.errors.rejectionReason}
                      minRows={3}
                    />
                  )}

                  <TextInput
                    label="Verified Plate Number *"
                    placeholder="ET 01 ABC 123"
                    {...validationForm.getInputProps('verifiedPlate')}
                    required
                    error={validationForm.errors.verifiedPlate}
                  />

                  <Textarea
                    label="Internal Notes"
                    placeholder="Team notes..."
                    {...validationForm.getInputProps('internalNotes')}
                  />
                </Stack>
              )}

              <Group justify="space-between" mt="lg">
                {validationStep > 0 && (
                  <Button 
                    variant="light" 
                    leftSection={<IconArrowLeft size={14} />} 
                    onClick={prevStep}
                  >
                    Back
                  </Button>
                )}

                {validationStep < 2 ? (
                  <Button 
                    rightSection={<IconArrowRight size={14} />} 
                    onClick={nextStep}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    color={validationForm.values.decision === 'approve' ? 'green' : 'red'}
                    leftSection={
                      validationForm.values.decision === 'approve' ? <IconCheck size={14} /> : <IconX size={14} />
                    }
                  >
                    {validationForm.values.decision === 'approve' ? '✅ Approve Ownership' : '❌ Reject Ownership'}
                  </Button>
                )}
              </Group>
            </Stack>
          </form>
        )}
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        opened={deleteModalOpened}
        onClose={deleteModalHandlers.close}
        title={<Text fw={700} size="lg">Delete Vehicle Documents</Text>}
        centered
        size="md"
        radius="md"
      >
        {selectedDocument && (
          <Stack gap="md">
            <Alert color="red" title="⚠️ Warning" icon={<IconAlertCircle size={16} />}>
              Delete all documents for vehicle <strong>{selectedDocument.vehiclePlate}</strong>?<br/>
              <Text size="sm" c="dimmed">This cannot be undone.</Text>
            </Alert>
            <Group justify="flex-end">
              <Button variant="subtle" onClick={deleteModalHandlers.close}>Cancel</Button>
              <Button color="red" onClick={deleteDocument}>Delete</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Box>
  );
}