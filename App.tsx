import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import { enqueuePickup } from './src/api';
import {
  DEFAULT_DEVICE_ID,
  IS_PRODUCTION,
} from './src/config';
import {
  SCHOOL_PICKUP_CLASS_CODES,
  type SchoolPickupClassCode,
} from './src/schoolPickupClasses';
import { useSchoolPickupSocket } from './src/useSchoolPickupSocket';

const PICKUP_TYPES = [
  { value: 'school_pickup', label: 'School Pickup' },
] as const;

type PickupTypeValue = (typeof PICKUP_TYPES)[number]['value'];

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#07110E" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <SchoolPickupScreen />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function SchoolPickupScreen() {
  const [deviceId, setDeviceId] = useState(DEFAULT_DEVICE_ID);
  const [name, setName] = useState('');
  const [className, setClassName] = useState<SchoolPickupClassCode | ''>('');
  const [pickupType, setPickupType] =
    useState<PickupTypeValue>('school_pickup');
  const [typeOpen, setTypeOpen] = useState(false);
  const [classOpen, setClassOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onQueue = useCallback(() => {
    // Board list removed — TV still receives socket updates from the server.
  }, []);

  const { connected } = useSchoolPickupSocket(deviceId, onQueue);

  const selectedTypeLabel = useMemo(
    () =>
      PICKUP_TYPES.find(t => t.value === pickupType)?.label ?? 'School Pickup',
    [pickupType],
  );

  async function onSubmit() {
    setError(null);
    setSuccess(null);

    const did = deviceId.trim();
    const n = name.trim();
    const c = className.trim();
    if (!did || !n || !c) {
      setError('Device ID, name, and class are required.');
      return;
    }
    if (!SCHOOL_PICKUP_CLASS_CODES.includes(c as SchoolPickupClassCode)) {
      setError('Please select a class from the list.');
      return;
    }

    setBusy(true);
    try {
      await enqueuePickup({
        deviceId: did,
        name: n,
        className: c,
        type: pickupType,
      });
      setSuccess(`${n} · ${c} sent to the lobby screen`);
      setName('');
      setClassName('');
    } catch (err) {
      const msg =
        (err as { response?: { data?: { error_key?: string } } })?.response
          ?.data?.error_key ||
        (err as Error)?.message ||
        'Request failed';
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          <Text style={styles.brand}>Kisko</Text>
          <Text style={styles.title}>School Pickup</Text>
          <Text style={styles.lede}>
            Send a student to the lobby screen in one tap.
          </Text>

          <View style={styles.statusRow}>
            <View style={[styles.dot, connected ? styles.dotOn : styles.dotOff]} />
            <Text style={styles.statusText}>
              {connected ? 'Live link ready' : 'Waiting for socket'}
            </Text>
            <View style={styles.envChip}>
              <Text style={styles.envChipText}>
                {IS_PRODUCTION ? 'Prod' : 'Dev'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Student details</Text>

          <Text style={styles.label}>Type</Text>
          <Pressable
            style={styles.select}
            onPress={() => setTypeOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Select pickup type"
          >
            <Text style={styles.selectValue}>{selectedTypeLabel}</Text>
            <Text style={styles.selectChevron}>▾</Text>
          </Pressable>

          <Text style={styles.label}>Kiosk device ID</Text>
          <TextInput
            style={styles.input}
            value={deviceId}
            onChangeText={setDeviceId}
            placeholder="Same ID as the TV app"
            placeholderTextColor="#6B7A70"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Student name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Ali Khan"
            placeholderTextColor="#6B7A70"
            returnKeyType="next"
          />

          <Text style={styles.label}>Class</Text>
          <Pressable
            style={styles.select}
            onPress={() => setClassOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Select class"
          >
            <Text
              style={[
                styles.selectValue,
                !className && styles.selectPlaceholder,
              ]}
            >
              {className || 'Select class'}
            </Text>
            <Text style={styles.selectChevron}>▾</Text>
          </Pressable>

          {error ? (
            <View style={[styles.banner, styles.bannerError]}>
              <Text style={styles.bannerErrorText}>{error}</Text>
            </View>
          ) : null}
          {success ? (
            <View style={[styles.banner, styles.bannerOk]}>
              <Text style={styles.bannerOkText}>{success}</Text>
            </View>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.cta,
              (busy || pressed) && styles.ctaPressed,
              busy && styles.ctaDisabled,
            ]}
            onPress={onSubmit}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="#062018" />
            ) : (
              <Text style={styles.ctaText}>School Pickup</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={typeOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setTypeOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setTypeOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select type</Text>
            {PICKUP_TYPES.map(option => {
              const selected = option.value === pickupType;
              return (
                <Pressable
                  key={option.value}
                  style={[styles.optionRow, selected && styles.optionRowOn]}
                  onPress={() => {
                    setPickupType(option.value);
                    setTypeOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextOn,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {selected ? <Text style={styles.optionCheck}>✓</Text> : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={classOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setClassOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setClassOpen(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select class</Text>
            <ScrollView
              style={styles.classList}
              keyboardShouldPersistTaps="handled"
            >
              {SCHOOL_PICKUP_CLASS_CODES.map(code => {
                const selected = code === className;
                return (
                  <Pressable
                    key={code}
                    style={[styles.optionRow, selected && styles.optionRowOn]}
                    onPress={() => {
                      setClassName(code);
                      setClassOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.optionTextOn,
                      ]}
                    >
                      {code}
                    </Text>
                    {selected ? (
                      <Text style={styles.optionCheck}>✓</Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#07110E',
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  hero: {
    paddingTop: 18,
    paddingBottom: 22,
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(46, 168, 112, 0.18)',
  },
  brand: {
    color: '#3ECF8E',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    color: '#F4F1EA',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  lede: {
    marginTop: 10,
    color: '#9AA89C',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 320,
  },
  statusRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOn: {
    backgroundColor: '#3ECF8E',
  },
  dotOff: {
    backgroundColor: '#7A6A4A',
  },
  statusText: {
    color: '#C5D0C7',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  envChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(244,241,234,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(244,241,234,0.12)',
  },
  envChipText: {
    color: '#9AA89C',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  card: {
    backgroundColor: '#12201A',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(244,241,234,0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  cardTitle: {
    color: '#F4F1EA',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  label: {
    marginTop: 14,
    marginBottom: 8,
    color: '#8FA094',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(244,241,234,0.1)',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    color: '#F4F1EA',
    fontSize: 16,
  },
  select: {
    borderWidth: 1,
    borderColor: 'rgba(244,241,234,0.1)',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectValue: {
    color: '#F4F1EA',
    fontSize: 16,
    fontWeight: '600',
  },
  selectPlaceholder: {
    color: '#6B7A70',
    fontWeight: '500',
  },
  classList: {
    maxHeight: 360,
  },
  selectChevron: {
    color: '#8FA094',
    fontSize: 16,
  },
  banner: {
    marginTop: 14,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  bannerError: {
    backgroundColor: 'rgba(232, 93, 76, 0.14)',
  },
  bannerErrorText: {
    color: '#FFB4AA',
    fontSize: 14,
    fontWeight: '600',
  },
  bannerOk: {
    backgroundColor: 'rgba(62, 207, 142, 0.14)',
  },
  bannerOkText: {
    color: '#B7EFD0',
    fontSize: 14,
    fontWeight: '600',
  },
  cta: {
    marginTop: 20,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3ECF8E',
  },
  ctaPressed: {
    transform: [{ scale: 0.985 }],
  },
  ctaDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    color: '#062018',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#14241D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderColor: 'rgba(244,241,234,0.08)',
  },
  modalTitle: {
    color: '#F4F1EA',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  optionRowOn: {
    backgroundColor: 'rgba(62, 207, 142, 0.14)',
  },
  optionText: {
    color: '#C5D0C7',
    fontSize: 16,
    fontWeight: '600',
  },
  optionTextOn: {
    color: '#3ECF8E',
  },
  optionCheck: {
    color: '#3ECF8E',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default App;
