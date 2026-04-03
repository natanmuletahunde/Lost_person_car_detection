// app/admin/data/[id]/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Title, Text, Paper, Group, Avatar, Badge, Grid,
  Button, Divider, Skeleton, Alert, ActionIcon,
  Container
} from '@mantine/core';
import { IconArrowLeft, IconEdit, IconAlertCircle } from '@tabler/icons-react';
import Link from 'next/link';
import { INITIAL_DATA } from '../data'; // shared data

export default function RecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id ? parseInt(params.id) : null;

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      const found = INITIAL_DATA.find(item => item.id === id);
      setRecord(found || null);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [id]);

  const handleEdit = () => {
    // Navigate back to main page and open edit modal? 
    // For simplicity, redirect to main page with a query param or state.
    // Here we just go back to the list.
    router.push('/admin/data');
  };

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Skeleton height={50} mb="md" />
        <Skeleton height={200} radius="md" />
      </Container>
    );
  }

  if (!record) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Not Found" color="red">
          The record with ID {id} does not exist.
        </Alert>
        <Button component={Link} href="/admin/data" leftSection={<IconArrowLeft size={16} />} mt="md">
          Back to Data Management
        </Button>
      </Container>
    );
  }

  return (
    <Box p="xl" bg="#F4F7FE" style={{ minHeight: '100vh' }}>
      <Container size="lg">
        {/* Back button and title */}
        <Group justify="space-between" mb="lg">
          <Group>
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => router.back()}
              size="lg"
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={2} fw={700} c="#2B3674">Record Details</Title>
          </Group>
          <Button
            leftSection={<IconEdit size={16} />}
            variant="light"
            color="blue"
            onClick={handleEdit}
            component={Link}
            href="/admin/data"
          >
            Edit Record
          </Button>
        </Group>

        {/* Detail card */}
        <Paper p="xl" radius="lg" shadow="md" withBorder>
          <Group gap="xl" mb="lg">
            <Avatar size={100} radius="xl" color="blue">
              {record.brand[0]}
            </Avatar>
            <Box>
              <Text fw={700} size="xxl" style={{ fontSize: '2rem' }}>{record.brand}</Text>
              <Group gap="xs" mt="xs">
                <Badge size="lg" color={record.status === 'Verified' ? 'green' : 'gray'}>
                  {record.status}
                </Badge>
                <Badge size="lg" color={record.alerts > 0 ? 'red' : 'gray'}>
                  {record.alerts} Alert{record.alerts !== 1 ? 's' : ''}
                </Badge>
              </Group>
            </Box>
          </Group>

          <Divider my="lg" />

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">Model</Text>
              <Text fw={500}>{record.model}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">Plate Number</Text>
              <Text fw={500} fw="monospace">{record.plate}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">Registered By</Text>
              <Text fw={500}>{record.user}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">Registration Date</Text>
              <Text fw={500}>{record.date}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">ID</Text>
              <Text fw={500}>{record.id}</Text>
            </Grid.Col>
          </Grid>

          <Divider my="lg" />

          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => router.back()}>
              Back
            </Button>
            <Button component={Link} href="/admin/data" color="blue">
              Go to List
            </Button>
          </Group>
        </Paper>
      </Container>
    </Box>
  );
}