import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import Ionicons from '@expo/vector-icons/Ionicons'
import { isSupabaseConfigured, supabase } from './lib/supabase'

const ADMIN_EMAILS = ['admin@email.com']

const navigationItems = [
  { id: 'home', label: 'Home', icon: 'home-outline', iconActive: 'home' },
  { id: 'practice', label: 'Practice', icon: 'flask-outline', iconActive: 'flask' },
  {
    id: 'entry',
    label: 'Resources',
    icon: 'library-outline',
    iconActive: 'library',
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    icon: 'bar-chart-outline',
    iconActive: 'bar-chart',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: 'person-circle-outline',
    iconActive: 'person-circle',
  },
]


const dayNamesToTwenty = [
  'Zero',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
  'Twenty',
]

const tensNames = {
  20: 'Twenty',
  30: 'Thirty',
  40: 'Forty',
  50: 'Fifty',
  60: 'Sixty',
  70: 'Seventy',
  80: 'Eighty',
}

const numberToWords = (num) => {
  if (num <= 20) return dayNamesToTwenty[num]
  if (num % 10 === 0) return tensNames[num]
  const tens = Math.floor(num / 10) * 10
  const ones = num % 10
  return `${tensNames[tens]} ${dayNamesToTwenty[ones]}`
}

const getOrdinalSuffix = (n) => {
  const v = n % 100
  if (v >= 11 && v <= 13) return 'th'
  switch (v % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

const PRACTICE_START = new Date('2026-03-06')

const getPracticeDate = (dayIndex) => {
  const d = new Date(PRACTICE_START)
  d.setDate(d.getDate() + dayIndex)
  const day = d.getDate()
  const month = d.toLocaleDateString('en-GB', { month: 'long' })
  const year = d.getFullYear()
  return `${day}${getOrdinalSuffix(day)} ${month} ${year}`
}

const practiceDays = Array.from({ length: 40 }, (_, index) => {
  const dayNumber = index + 1
  return {
    id: `day${dayNumber}`,
    label: `Day ${numberToWords(dayNumber)}`,
    date: getPracticeDate(index),
  }
})

const fallbackLeaderboardData = [
  // Main category
  { student: 'Fabian Kudoto', overall: 0, Physics: 0, Chemistry: 0, Biology: 0, Mathematics: 0, GK: 0, category: 'main' },
  { student: 'Norbert Adusei', overall: 0, Physics: 0, Chemistry: 0, Biology: 0, Mathematics: 0, GK: 0, category: 'main' },
  { student: 'Emmanuel Akormedie', overall: 0, Physics: 0, Chemistry: 0, Biology: 0, Mathematics: 0, GK: 0, category: 'main' },
  { student: 'Princess Amedzro', overall: 0, Physics: 0, Chemistry: 0, Biology: 0, Mathematics: 0, GK: 0, category: 'main' },
  { student: 'Japheth Nii Boye', overall: 0, Physics: 0, Chemistry: 0, Biology: 0, Mathematics: 0, GK: 0, category: 'main' },
  { student: 'Michael Danso', overall: 0, Physics: 0, Chemistry: 0, Biology: 0, Mathematics: 0, GK: 0, category: 'main' },
  { student: 'Hilarious Bansah', overall: 0, Physics: 0, Chemistry: 0, Biology: 0, Mathematics: 0, GK: 0, category: 'main' },
  { student: 'Prince Gewalk Martins', overall: 0, Physics: 0, Chemistry: 0, Biology: 0, Mathematics: 0, GK: 0, category: 'main' },
  // Substitute category
  { student: 'Jovan Akuaku', overall: 0, Physics: 0, Chemistry: 0, Biology: 0, Mathematics: 0, GK: 0, category: 'substitute' },
  { student: 'Vera Narh', overall: 0, Physics: 0, Chemistry: 0, Biology: 0, Mathematics: 0, GK: 0, category: 'substitute' },
  { student: 'Ann Hanson', overall: 0, Physics: 0, Chemistry: 0, Biology: 0, Mathematics: 0, GK: 0, category: 'substitute' },
  { student: 'George Frimpong', overall: 0, Physics: 0, Chemistry: 0, Biology: 0, Mathematics: 0, GK: 0, category: 'substitute' },
  { student: 'Clifford Anum', overall: 0, Physics: 0, Chemistry: 0, Biology: 0, Mathematics: 0, GK: 0, category: 'substitute' },
]

const initialEntries = [
  {
    id: 1,
    title: 'Organic Chemistry Summary Deck',
    type: 'Document',
    subject: 'Chemistry',
    details: 'A compact revision deck for hydrocarbons and reaction pathways.',
    author: 'Coach Mensima',
    date: 'Apr 23, 2026',
  },
]

const weeklyGoals = [
  'Attempt 50 rapid-fire questions',
  'Revise at least 2 weak science topics',
  'Complete one timed mock each weekend',
  'Post one useful resource in the app',
]

const PRIORITY_COLORS = { High: '#e63946', Medium: '#fb8500', Low: '#2d6a4f' }
const SUBJECT_COLORS = {
  Physics: '#0f4c5c', Chemistry: '#219ebc', Biology: '#2d6a4f',
  Mathematics: '#fb8500', GK: '#6c757d', General: '#36536b',
}
const getSubjectColor = (s) => SUBJECT_COLORS[s] || '#36536b'

const initialTasks = [
  { id: 1, title: 'Attempt 50 rapid-fire questions', subject: 'General', priority: 'High', dueDate: 'Jun 6, 2026', done: false, source: 'local' },
  { id: 2, title: 'Revise weak topics in Organic Chemistry', subject: 'Chemistry', priority: 'High', dueDate: 'Jun 8, 2026', done: false, source: 'local' },
  { id: 3, title: 'Complete timed mock — Physics section', subject: 'Physics', priority: 'Medium', dueDate: 'Jun 10, 2026', done: false, source: 'local' },
  { id: 4, title: 'Review Integration techniques', subject: 'Mathematics', priority: 'Medium', dueDate: 'Jun 12, 2026', done: false, source: 'local' },
  { id: 5, title: 'Post one Biology resource in the app', subject: 'Biology', priority: 'Low', dueDate: 'Jun 14, 2026', done: false, source: 'local' },
]

const subjects = ['overall', 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'GK']
const practiceSubjectTabs = ['Physics', 'Chemistry', 'Biology', 'E-Maths']

const SYMBOL_CATEGORIES = [
  {
    key: 'maths',
    label: 'Maths',
    symbols: [
      '÷', '×', '±', '√', '∛', '∜', '∞', '≠', '≈', '≡', '≤', '≥', '≪', '≫', '∝', '∴', '∵',
      '∫', '∬', '∮', '∂', '∑', '∏', 'Δ', '∇', '′', '″', '‴',
      '∈', '∉', '∪', '∩', '⊂', '⊄', '⊃', '⊅', '∅', '∀', '∃', '∄',
      '°', 'π', '∠', '∡', '⊥', '∥', '∦', '≅', '∼', '≜',
      '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹', '⁻¹', '⁻²',
      '½', '⅓', '¼', '¾', '⅔', '⅛', '⅜', '⅝', '⅞',
      '₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉',
      'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ',
      'ν', 'ξ', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω',
      'Γ', 'Δ', 'Θ', 'Λ', 'Ξ', 'Π', 'Σ', 'Υ', 'Φ', 'Ψ', 'Ω',
    ],
  },
  {
    key: 'physics',
    label: 'Physics',
    symbols: [
      'α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ', 'μ', 'ν', 'ρ', 'σ', 'τ', 'φ', 'ω', 'Ω',
      'ℏ', 'Å', '∇', '∂', '∞',
      '→', '←', '↑', '↓', '↗', '↙', '⇒', '⇔', '⇌',
      '±', '×', '·', '÷', '√',
      '₀', '₁', '₂', '₃', '₄', '₅',
      '⁰', '¹', '²', '³', '⁴', '⁵', '⁻', '⁺',
      '∫', 'Δ', '∑', 'π', '°',
      'N', 'J', 'W', 'Pa', 'Hz', 'eV', 'kg', 'm/s', 'm/s²',
    ],
  },
  {
    key: 'chemistry',
    label: 'Chemistry',
    symbols: [
      '→', '⇌', '⇒', '↑', '↓', 'Δ',
      '⁺', '⁻', '²⁺', '²⁻', '³⁺', '³⁻', '⁴⁺', '⁴⁻',
      '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₁₀', 'ₙ', 'ₓ',
      '⁰', '¹', '²', '³', '°', '±', '≡',
      '(s)', '(l)', '(g)', '(aq)',
      'H₂O', 'CO₂', 'O₂', 'N₂', 'H₂', 'Cl₂', 'NH₃',
      'H₂SO₄', 'HCl', 'NaOH', 'NaCl', 'CaCO₃', 'HNO₃',
      'mol', 'mol/L', 'g/mol', 'kJ/mol',
    ],
  },
]

const RESOURCE_SUBJECTS = [
  { name: 'Physics', icon: 'planet-outline', color: '#0f4c5c' },
  { name: 'Chemistry', icon: 'flask-outline', color: '#219ebc' },
  { name: 'Biology', icon: 'leaf-outline', color: '#2d6a4f' },
  { name: 'Mathematics', icon: 'calculator-outline', color: '#fb8500' },
]
const RESOURCE_TYPES = ['PDF', 'Book', 'Document', 'Video', 'Link', 'Notes']

const formatEntryDate = (rawDate) => {
  if (!rawDate) return ''
  return new Date(rawDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const mapSupabaseEntry = (entry) => ({
  id: entry.id,
  title: entry.title,
  type: entry.type,
  subject: entry.subject,
  details: entry.details,
  author: entry.author,
  date: formatEntryDate(entry.created_at),
})

const mapSupabaseLeaderboard = (row) => ({
  student: row.student,
  overall: row.overall,
  Physics: row.physics,
  Chemistry: row.chemistry,
  Biology: row.biology,
  Mathematics: row.mathematics,
  GK: row.gk,
  category: row.category ?? 'main',
})

const mapSupabasePracticeRecord = (row) => ({
  id: row.id,
  dayId: row.day_id,
  subject: row.subject,
  title: row.title,
  details: row.details,
  answer: row.answer ?? '',
  solution: row.solution ?? '',
  author: row.author,
  date: formatEntryDate(row.created_at),
})

const getUserDisplayName = (user) => {
  if (!user) return ''
  if (user.user_metadata?.full_name) return user.user_metadata.full_name
  if (user.email) return user.email.split('@')[0]
  return 'NSMQ Student'
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  )
}

function AppContent() {
  const insets = useSafeAreaInsets()
  const [activePage, setActivePage] = useState('home')
  const [selectedDay, setSelectedDay] = useState(practiceDays[0].id)
  const [openedPracticeDayId, setOpenedPracticeDayId] = useState(null)
  const [selectedPracticeSubject, setSelectedPracticeSubject] = useState('Physics')
  const [selectedSubject, setSelectedSubject] = useState('overall')
  const [entries, setEntries] = useState(initialEntries)
  const [leaderboardRows, setLeaderboardRows] = useState(fallbackLeaderboardData)
  const [isSyncingEntries, setIsSyncingEntries] = useState(false)
  const [isSyncingLeaderboard, setIsSyncingLeaderboard] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthBusy, setIsAuthBusy] = useState(false)
  const [authMode, setAuthMode] = useState('signIn')
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'student',
  })
  const [authStatus, setAuthStatus] = useState(
    isSupabaseConfigured
      ? 'Sign in to sync your identity across submissions.'
      : 'Supabase not configured. Authentication unavailable.',
  )
  const [entryStatus, setEntryStatus] = useState(
    isSupabaseConfigured
      ? 'Connected to Supabase. Entry feed is syncing.'
      : 'Supabase not configured. Using local entry storage only.',
  )
  const [leaderboardStatus, setLeaderboardStatus] = useState(
    isSupabaseConfigured
      ? 'Connected to Supabase. Leaderboard is syncing.'
      : 'Supabase not configured. Using local leaderboard data.',
  )
  const [goalChecks, setGoalChecks] = useState(
    weeklyGoals.map((goal) => ({ goal, done: false })),
  )
  const [tasks, setTasks] = useState(initialTasks)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', subject: 'Physics', priority: 'Medium', dueDate: '' })
  const [taskFilter, setTaskFilter] = useState('all')
  const [notes, setNotes] = useState([])
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [noteForm, setNoteForm] = useState({ title: '', content: '' })
  const [expandedNote, setExpandedNote] = useState(null)
  const [practiceRecords, setPracticeRecords] = useState([])
  const [isSyncingPractice, setIsSyncingPractice] = useState(false)
  const [practiceStatus, setPracticeStatus] = useState(
    isSupabaseConfigured
      ? 'Connect a day and subject to load saved practice data.'
      : 'Supabase not configured. Practice data will stay local only.',
  )
  const [practiceForm, setPracticeForm] = useState({
    title: '',
    details: '',
    answer: '',
    solution: '',
  })
  const [expandedPractice, setExpandedPractice] = useState({})
  const [showPracticeForm, setShowPracticeForm] = useState(false)
  const [showSymbolPicker, setShowSymbolPicker] = useState(false)
  const [symbolCategoryTab, setSymbolCategoryTab] = useState('maths')
  const [focusedPracticeField, setFocusedPracticeField] = useState('details')
  const [entryForm, setEntryForm] = useState({
    title: '',
    type: 'Question',
    subject: 'General',
    details: '',
    author: '',
  })

  const [homePosts, setHomePosts] = useState([])
  const [showHomePostForm, setShowHomePostForm] = useState(false)
  const [homePostForm, setHomePostForm] = useState({ content: '', category: 'Announcement', imageUri: null })
  const [homeFormMode, setHomeFormMode] = useState('post')
  const [adminTaskForm, setAdminTaskForm] = useState({ title: '', subject: 'Physics', priority: 'Medium', dueDate: '' })
  const [isPublishingAdminTask, setIsPublishingAdminTask] = useState(false)
  const [adminTaskStatus, setAdminTaskStatus] = useState('')
  const [isSyncingHomePosts, setIsSyncingHomePosts] = useState(false)
  const [homePostStatus, setHomePostStatus] = useState('')

  const [resources, setResources] = useState([])
  const [expandedSubject, setExpandedSubject] = useState(null)
  const [showResourceForm, setShowResourceForm] = useState(null)
  const [resourceForm, setResourceForm] = useState({ title: '', url: '', fileType: 'Document', description: '' })
  const [isSyncingResources, setIsSyncingResources] = useState(false)
  const [resourceStatus, setResourceStatus] = useState('')

  // Admin modal state
  const [selectedLeaderboardCategory, setSelectedLeaderboardCategory] = useState('main')
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [newLeaderboard, setNewLeaderboard] = useState({
    student: '',
    overall: '',
    Physics: '',
    Chemistry: '',
    Biology: '',
    Mathematics: '',
    GK: '',
    category: 'main',
  });
  const [isSavingLeaderboard, setIsSavingLeaderboard] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Check if current user is admin
  const isAdmin = currentUser && ADMIN_EMAILS.includes(currentUser.email);
  const isTrainer = currentUser?.user_metadata?.role === 'trainer'

  const currentDay =
    practiceDays.find((practiceDay) => practiceDay.id === selectedDay) ||
    practiceDays[0]

  const sortedLeaderboard = useMemo(() => {
    const metric = selectedSubject === 'overall' ? 'overall' : selectedSubject
    return [...leaderboardRows]
      .sort((a, b) => b[metric] - a[metric])
      .map((student, index) => ({ ...student, position: index + 1 }))
  }, [leaderboardRows, selectedSubject])

  const subjectAverages = useMemo(() => {
    if (leaderboardRows.length === 0) return { Physics: 0, Chemistry: 0, Biology: 0, Mathematics: 0, GK: 0 }
    const sums = { Physics: 0, Chemistry: 0, Biology: 0, Mathematics: 0, GK: 0 }
    leaderboardRows.forEach((r) => {
      sums.Physics += r.Physics
      sums.Chemistry += r.Chemistry
      sums.Biology += r.Biology
      sums.Mathematics += r.Mathematics
      sums.GK += r.GK
    })
    const count = leaderboardRows.length
    return {
      Physics: Math.round(sums.Physics / count),
      Chemistry: Math.round(sums.Chemistry / count),
      Biology: Math.round(sums.Biology / count),
      Mathematics: Math.round(sums.Mathematics / count),
      GK: Math.round(sums.GK / count),
    }
  }, [leaderboardRows])

  const completedGoals = goalChecks.filter((item) => item.done).length
  const goalProgress = Math.round((completedGoals / goalChecks.length) * 100)

  const scopedPracticeRecords = useMemo(() => {
    if (!openedPracticeDayId) return []
    return practiceRecords.filter(
      (record) =>
        record.dayId === openedPracticeDayId &&
        record.subject.toLowerCase() === selectedPracticeSubject.toLowerCase(),
    )
  }, [openedPracticeDayId, practiceRecords, selectedPracticeSubject])

  const onChangeForm = (field, value) => {
    setEntryForm((prev) => ({ ...prev, [field]: value }))
  }

  const onChangePracticeForm = (field, value) => {
    setPracticeForm((prev) => ({ ...prev, [field]: value }))
  }

  const insertSymbol = (symbol) => {
    setPracticeForm((prev) => ({
      ...prev,
      [focusedPracticeField]: (prev[focusedPracticeField] || '') + symbol,
    }))
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return

    let isMounted = true

    const loadCurrentUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (!isMounted) return

      if (error) {
        setAuthStatus('Could not verify current auth session.')
        return
      }

      setCurrentUser(data.user ?? null)
      if (data.user) {
        setAuthStatus(`Signed in as ${getUserDisplayName(data.user)}.`)
      }
    }

    loadCurrentUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null)
      if (session?.user) {
        setAuthStatus(`Signed in as ${getUserDisplayName(session.user)}.`)
      }
      if (!session?.user) {
        setAuthStatus('Signed out. Sign in to sync your identity across submissions.')
      }
    })

    const loadSupabaseEntries = async () => {
      setIsSyncingEntries(true)
      const { data, error } = await supabase
        .from('entry_posts')
        .select('id,title,type,subject,details,author,created_at')
        .order('created_at', { ascending: false })
        .limit(60)

      if (error) {
        setEntryStatus('Supabase connection failed for entry feed. Using local data.')
        setIsSyncingEntries(false)
        return
      }

      if (data && data.length > 0) {
        setEntries(data.map(mapSupabaseEntry))
      }
      setEntryStatus('Entry feed synced with Supabase.')
      setIsSyncingEntries(false)
    }

    const loadSupabaseLeaderboard = async () => {
      setIsSyncingLeaderboard(true)
      const { data, error } = await supabase
        .from('leaderboard_scores')
        .select('student,overall,physics,chemistry,biology,mathematics,gk,category')
        .order('overall', { ascending: false })
        .limit(60)

      if (error) {
        setLeaderboardStatus('Supabase connection failed for leaderboard. Using local data.')
        setIsSyncingLeaderboard(false)
        return
      }

      if (data && data.length > 0) {
        setLeaderboardRows(data.map(mapSupabaseLeaderboard))
      }
      setLeaderboardStatus('Leaderboard synced with Supabase.')
      setIsSyncingLeaderboard(false)
    }

    const loadHomePosts = async () => {
      const { data, error } = await supabase
        .from('home_posts')
        .select('id,content,category,author,user_id,image_url,created_at')
        .order('created_at', { ascending: false })
        .limit(40)

      if (error || !data) return

      if (data.length > 0) {
        setHomePosts(
          data.map((row) => ({
            id: row.id,
            content: row.content,
            category: row.category,
            author: row.author,
            userId: row.user_id ?? null,
            imageUrl: row.image_url ?? null,
            date: formatEntryDate(row.created_at),
          })),
        )
      }
    }

    const loadResources = async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('id,subject,title,description,url,file_type,author,created_at')
        .order('created_at', { ascending: true })
        .limit(500)
      if (error || !data) return
      setResources(
        data.map((row) => ({
          id: row.id,
          subject: row.subject,
          title: row.title,
          description: row.description || '',
          url: row.url || '',
          fileType: row.file_type,
          author: row.author,
          date: formatEntryDate(row.created_at),
        })),
      )
    }

    const loadAssignedTasks = async () => {
      const { data, error } = await supabase
        .from('assigned_tasks')
        .select('id,title,subject,priority,due_date,author,created_at')
        .order('created_at', { ascending: false })
        .limit(50)
      if (error || !data || data.length === 0) return
      setTasks((prev) => {
        const doneSet = new Set(
          prev.filter((t) => t.source === 'admin' && t.done).map((t) => t.supabaseId),
        )
        const localTasks = prev.filter((t) => t.source !== 'admin')
        const adminTasks = data.map((row) => ({
          id: `admin-${row.id}`,
          supabaseId: row.id,
          title: row.title,
          subject: row.subject,
          priority: row.priority,
          dueDate: row.due_date || '',
          done: doneSet.has(row.id),
          source: 'admin',
          author: row.author,
        }))
        return [...adminTasks, ...localTasks]
      })
    }

    loadSupabaseEntries()
    loadSupabaseLeaderboard()
    loadHomePosts()
    loadResources()
    loadAssignedTasks()

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!openedPracticeDayId) return
    if (!isSupabaseConfigured) return

    const loadPracticeRecords = async () => {
      setIsSyncingPractice(true)
      const { data, error } = await supabase
        .from('practice_day_subject_notes')
        .select('id,day_id,subject,title,details,answer,solution,author,created_at')
        .eq('day_id', openedPracticeDayId)
        .eq('subject', selectedPracticeSubject)
        .order('created_at', { ascending: true })
        .limit(500)

      if (error) {
        setPracticeStatus('Could not load practice data from Supabase for this section.')
        setIsSyncingPractice(false)
        return
      }

      const mapped = (data || []).map(mapSupabasePracticeRecord)
      setPracticeRecords((prev) => {
        const remaining = prev.filter(
          (record) =>
            !(
              record.dayId === openedPracticeDayId &&
              record.subject.toLowerCase() === selectedPracticeSubject.toLowerCase()
            ),
        )
        return [...remaining, ...mapped]
      })
      setPracticeStatus('Practice section synced with Supabase.')
      setIsSyncingPractice(false)
    }

    loadPracticeRecords()
  }, [openedPracticeDayId, selectedPracticeSubject])

  const handleAuthFieldChange = (field, value) => {
    setAuthForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleAuthSubmit = async () => {
    if (!isSupabaseConfigured) return

    const email = authForm.email.trim()
    const password = authForm.password.trim()
    const fullName = authForm.fullName.trim()

    if (!email || !password) {
      setAuthStatus('Email and password are required.')
      return
    }

    setIsAuthBusy(true)

    if (authMode === 'signUp') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email.split('@')[0],
            role: authForm.role,
          },
        },
      })

      if (error) {
        setAuthStatus(`Sign up failed: ${error.message}`)
        setIsAuthBusy(false)
        return
      }

      setAuthStatus('Account created. Check email verification settings, then sign in.')
      setIsAuthBusy(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setAuthStatus(`Sign in failed: ${error.message}`)
      setIsAuthBusy(false)
      return
    }

    setAuthStatus(`Signed in as ${email}.`)
    setAuthForm((prev) => ({ ...prev, password: '' }))
    setIsAuthBusy(false)
  }

  const handleSignOut = async () => {
    if (!isSupabaseConfigured) return
    setIsAuthBusy(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      setAuthStatus(`Sign out failed: ${error.message}`)
      setIsAuthBusy(false)
      return
    }
    setIsAuthBusy(false)
    setAuthStatus('Signed out successfully.')
  }

  const publishEntry = async () => {
    const requiresManualAuthor = !isSupabaseConfigured
    if (
      !entryForm.title.trim() ||
      !entryForm.details.trim() ||
      (requiresManualAuthor && !entryForm.author.trim())
    ) {
      return
    }

    if (isSupabaseConfigured && !currentUser) {
      setEntryStatus('Please sign in on the Profile tab before publishing to Supabase.')
      return
    }

    const authorName = isSupabaseConfigured
      ? getUserDisplayName(currentUser)
      : entryForm.author.trim()

    const localEntry = {
      id: Date.now(),
      title: entryForm.title.trim(),
      type: entryForm.type,
      subject: entryForm.subject,
      details: entryForm.details.trim(),
      author: authorName,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    }

    if (!isSupabaseConfigured) {
      setEntries((prev) => [localEntry, ...prev])
      setEntryStatus('Saved locally. Add Supabase credentials to sync entries online.')
      setEntryForm({
        title: '',
        type: 'Question',
        subject: 'General',
        details: '',
        author: '',
      })
      return
    }

    setIsSyncingEntries(true)
    const { data, error } = await supabase
      .from('entry_posts')
      .insert({
        title: localEntry.title,
        type: localEntry.type,
        subject: localEntry.subject,
        details: localEntry.details,
        author: authorName,
        user_id: currentUser.id,
      })
      .select('id,title,type,subject,details,author,created_at')
      .single()

    if (error) {
      setEntries((prev) => [localEntry, ...prev])
      setEntryStatus('Supabase insert failed. Saved locally for now.')
      setIsSyncingEntries(false)
      setEntryForm({
        title: '',
        type: 'Question',
        subject: 'General',
        details: '',
        author: '',
      })
      return
    }

    setEntries((prev) => [mapSupabaseEntry(data), ...prev])
    setEntryStatus('Entry posted and synced to Supabase.')
    setIsSyncingEntries(false)
    setEntryForm({
      title: '',
      type: 'Question',
      subject: 'General',
      details: '',
      author: '',
    })
  }

  const publishPracticeRecord = async () => {
    if (!openedPracticeDayId) return
    if (!practiceForm.title.trim() || !practiceForm.details.trim()) return

    if (isSupabaseConfigured && !currentUser) {
      setPracticeStatus('Sign in on Profile tab to save practice data to Supabase.')
      return
    }

    const authorName = isSupabaseConfigured
      ? getUserDisplayName(currentUser)
      : 'Local User'

    const localRecord = {
      id: Date.now(),
      dayId: openedPracticeDayId,
      subject: selectedPracticeSubject,
      title: practiceForm.title.trim(),
      details: practiceForm.details.trim(),
      answer: practiceForm.answer.trim(),
      solution: practiceForm.solution.trim(),
      author: authorName,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    }

    if (!isSupabaseConfigured) {
      setPracticeRecords((prev) => [localRecord, ...prev])
      setPracticeStatus('Saved locally for this day and subject.')
      setPracticeForm({ title: '', details: '', answer: '', solution: '' })
      setShowPracticeForm(false)
      setShowSymbolPicker(false)
      return
    }

    setIsSyncingPractice(true)
    const { data, error } = await supabase
      .from('practice_day_subject_notes')
      .insert({
        day_id: openedPracticeDayId,
        subject: selectedPracticeSubject,
        title: localRecord.title,
        details: localRecord.details,
        answer: localRecord.answer,
        solution: localRecord.solution,
        author: authorName,
        user_id: currentUser.id,
      })
      .select('id,day_id,subject,title,details,answer,solution,author,created_at')
      .single()

    if (error) {
      setPracticeRecords((prev) => [localRecord, ...prev])
      setPracticeStatus('Supabase save failed. Saved locally for now.')
      setIsSyncingPractice(false)
      setPracticeForm({ title: '', details: '', answer: '', solution: '' })
      setShowPracticeForm(false)
      setShowSymbolPicker(false)
      return
    }

    setPracticeRecords((prev) => [mapSupabasePracticeRecord(data), ...prev])
    setPracticeStatus('Practice data saved and synced to Supabase.')
    setIsSyncingPractice(false)
    setPracticeForm({ title: '', details: '', answer: '', solution: '' })
    setShowPracticeForm(false)
    setShowSymbolPicker(false)
  }

  const pickPostImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      setHomePostStatus('Gallery permission is required to attach a thumbnail.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    })
    if (!result.canceled) {
      setHomePostForm((prev) => ({ ...prev, imageUri: result.assets[0].uri }))
    }
  }

  const uploadPostImage = async (localUri) => {
    try {
      const response = await fetch(localUri)
      const arrayBuffer = await response.arrayBuffer()
      const fileName = `post-${Date.now()}.jpg`
      const { error } = await supabase.storage
        .from('post-images')
        .upload(fileName, arrayBuffer, { contentType: 'image/jpeg', upsert: false })
      if (error) return null
      const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(fileName)
      return urlData.publicUrl
    } catch {
      return null
    }
  }

  const publishHomePost = async () => {
    if (!homePostForm.content.trim()) return

    if (isSupabaseConfigured && !currentUser) {
      setHomePostStatus('Sign in on the Profile tab to post to the community feed.')
      return
    }

    const authorName = isSupabaseConfigured
      ? getUserDisplayName(currentUser)
      : 'Anonymous'

    setIsSyncingHomePosts(true)

    let imageUrl = null
    if (isSupabaseConfigured && homePostForm.imageUri) {
      setHomePostStatus('Uploading image…')
      imageUrl = await uploadPostImage(homePostForm.imageUri)
    }

    const localPost = {
      id: Date.now(),
      content: homePostForm.content.trim(),
      category: homePostForm.category,
      author: authorName,
      userId: currentUser?.id ?? null,
      imageUrl: homePostForm.imageUri ?? null,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    }

    if (!isSupabaseConfigured) {
      setHomePosts((prev) => [localPost, ...prev])
      setShowHomePostForm(false)
      setHomePostForm({ content: '', category: 'Announcement', imageUri: null })
      setIsSyncingHomePosts(false)
      return
    }

    const { data, error } = await supabase
      .from('home_posts')
      .insert({
        content: localPost.content,
        category: localPost.category,
        author: authorName,
        user_id: currentUser.id,
        image_url: imageUrl,
      })
      .select('id,content,category,author,image_url,created_at')
      .single()

    if (error) {
      setHomePosts((prev) => [localPost, ...prev])
      setHomePostStatus('Supabase save failed. Saved locally.')
      setIsSyncingHomePosts(false)
      setShowHomePostForm(false)
      setHomePostForm({ content: '', category: 'Announcement', imageUri: null })
      return
    }

    setHomePosts((prev) => [
      {
        id: data.id,
        content: data.content,
        category: data.category,
        author: data.author,
        userId: currentUser?.id ?? null,
        imageUrl: data.image_url ?? null,
        date: formatEntryDate(data.created_at),
      },
      ...prev,
    ])
    setHomePostStatus('Post published.')
    setIsSyncingHomePosts(false)
    setShowHomePostForm(false)
    setHomePostForm({ content: '', category: 'Announcement', imageUri: null })
  }

  const deleteHomePost = async (postId) => {
    setHomePosts((prev) => prev.filter((p) => p.id !== postId))
    if (!isSupabaseConfigured) return
    await supabase.from('home_posts').delete().eq('id', postId)
  }

  const publishResource = async (subject) => {
    if (!resourceForm.title.trim()) return
    if (isSupabaseConfigured && !currentUser) {
      setResourceStatus('Sign in on the Profile tab to add resources.')
      return
    }
    const authorName = isSupabaseConfigured ? getUserDisplayName(currentUser) : 'Anonymous'
    const localResource = {
      id: Date.now(),
      subject,
      title: resourceForm.title.trim(),
      description: resourceForm.description.trim(),
      url: resourceForm.url.trim(),
      fileType: resourceForm.fileType,
      author: authorName,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }
    if (!isSupabaseConfigured) {
      setResources((prev) => [...prev, localResource])
      setShowResourceForm(null)
      setResourceForm({ title: '', url: '', fileType: 'Document', description: '' })
      return
    }
    setIsSyncingResources(true)
    const { data, error } = await supabase
      .from('resources')
      .insert({
        subject,
        title: localResource.title,
        description: localResource.description,
        url: localResource.url,
        file_type: localResource.fileType,
        author: authorName,
        user_id: currentUser.id,
      })
      .select('id,subject,title,description,url,file_type,author,created_at')
      .single()
    if (error) {
      setResources((prev) => [...prev, localResource])
      setResourceStatus('Supabase save failed. Saved locally.')
      setIsSyncingResources(false)
      setShowResourceForm(null)
      setResourceForm({ title: '', url: '', fileType: 'Document', description: '' })
      return
    }
    setResources((prev) => [
      ...prev,
      {
        id: data.id,
        subject: data.subject,
        title: data.title,
        description: data.description || '',
        url: data.url || '',
        fileType: data.file_type,
        author: data.author,
        date: formatEntryDate(data.created_at),
      },
    ])
    setResourceStatus('Resource added.')
    setIsSyncingResources(false)
    setShowResourceForm(null)
    setResourceForm({ title: '', url: '', fileType: 'Document', description: '' })
  }

  const getYouTubeVideoId = (url) => {
    if (!url) return null
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    ]
    for (const p of patterns) {
      const m = url.match(p)
      if (m) return m[1]
    }
    return null
  }

  const RESOURCE_TYPE_ICONS = {
    Video: 'videocam-outline',
    PDF: 'document-text-outline',
    Book: 'book-outline',
    Document: 'document-outline',
    Notes: 'create-outline',
    Link: 'link-outline',
  }

  const openResource = async (url) => {
    if (!url) return
    try {
      const canOpen = await Linking.canOpenURL(url)
      if (canOpen) await Linking.openURL(url)
    } catch {}
  }

  const toggleGoal = (index) => {
    setGoalChecks((prev) =>
      prev.map((item, i) => (i === index ? { ...item, done: !item.done } : item)),
    )
  }

  const addTask = () => {
    if (!taskForm.title.trim()) return
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), title: taskForm.title.trim(), subject: taskForm.subject, priority: taskForm.priority, dueDate: taskForm.dueDate.trim(), done: false, source: 'local' },
    ])
    setTaskForm({ title: '', subject: 'Physics', priority: 'Medium', dueDate: '' })
    setShowTaskForm(false)
  }

  const publishAdminTask = async () => {
    if (!adminTaskForm.title.trim()) return
    if (!isSupabaseConfigured || !currentUser) {
      setAdminTaskStatus('Sign in to assign tasks.')
      return
    }
    setIsPublishingAdminTask(true)
    setAdminTaskStatus('')
    const { data, error } = await supabase
      .from('assigned_tasks')
      .insert({
        title: adminTaskForm.title.trim(),
        subject: adminTaskForm.subject,
        priority: adminTaskForm.priority,
        due_date: adminTaskForm.dueDate.trim() || null,
        author: getUserDisplayName(currentUser),
        user_id: currentUser.id,
      })
      .select('id,title,subject,priority,due_date,author,created_at')
      .single()
    if (error) {
      setAdminTaskStatus('Failed to save task. Try again.')
      setIsPublishingAdminTask(false)
      return
    }
    setTasks((prev) => [
      {
        id: `admin-${data.id}`,
        supabaseId: data.id,
        title: data.title,
        subject: data.subject,
        priority: data.priority,
        dueDate: data.due_date || '',
        done: false,
        source: 'admin',
        author: data.author,
      },
      ...prev,
    ])
    setAdminTaskStatus('Task assigned to all users!')
    setIsPublishingAdminTask(false)
    setAdminTaskForm({ title: '', subject: 'Physics', priority: 'Medium', dueDate: '' })
  }

  const toggleTask = (id) => setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t))
  const deleteTask = (id) => setTasks((prev) => prev.filter((t) => t.id !== id))

  const addNote = () => {
    if (!noteForm.title.trim()) return
    setNotes((prev) => [
      { id: Date.now(), title: noteForm.title.trim(), content: noteForm.content.trim(), createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
      ...prev,
    ])
    setNoteForm({ title: '', content: '' })
    setShowNoteForm(false)
  }

  const deleteNote = (id) => setNotes((prev) => prev.filter((n) => n.id !== id))

  const pageHeading = {
    home: 'Upcoming Trials, News and Fixtures',
    practice: 'Practice Tabs, Dates and Question Banks',
    entry: 'Physics, Chemistry, Biology and Mathematics Resources',
    leaderboard: 'Ranking by Subject and Total Performance',
    profile: 'Progress Tracking and Growth Overview',
  }

  const trialPosts    = homePosts.filter((p) => p.category === 'Trial Notice')
  const announcePosts = homePosts.filter((p) => p.category === 'Announcement')
  const fixturePosts  = homePosts.filter((p) => p.category === 'Fixture')
  const communityPosts = homePosts.filter((p) => !['Trial Notice', 'Announcement', 'Fixture'].includes(p.category))
  const nextFixture   = fixturePosts[0] ?? null

  const quickStats = [
    { label: 'Upcoming Trials', value: trialPosts.length },
    { label: 'Community Posts', value: communityPosts.length },
    { label: 'Upcoming Fixtures', value: fixturePosts.length },
  ]

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 110 + insets.bottom }]}>
        <View style={styles.headerCard}>
          <Text style={styles.eyebrow}>ACHIMOTA NSMQ APP</Text>
          <Text style={styles.h1}>{pageHeading[activePage]}</Text>
          <Text style={styles.muted}>A focused space for contestants, coaches, and academic support.</Text>
        </View>

        {activePage === 'home' && (
          <>
            <View style={styles.homeHeroCard}>
              <View style={styles.homeHeroStripe} />
              <Text style={styles.homeHeroOverline}>Competition Readiness Dashboard</Text>
              <Text style={styles.homeHeroTitle}>Achimota Squad Status: On Track</Text>
              <Text style={styles.homeHeroSubtitle}>
                Stay aligned with training sessions, trial contests, and key updates ahead of each NSMQ stage.
              </Text>

              <View style={styles.statsRow}>
                {quickStats.map((stat) => (
                  <View key={stat.label} style={styles.statCard}>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.fixtureSpotlight}>
                <Text style={styles.fixtureSpotlightLabel}>Next Fixture Spotlight</Text>
                {nextFixture ? (
                  <>
                    <Text style={styles.fixtureSpotlightTitle}>{nextFixture.content}</Text>
                    <Text style={styles.fixtureSpotlightMeta}>{nextFixture.date} · By {nextFixture.author}</Text>
                  </>
                ) : (
                  <Text style={styles.fixtureSpotlightMeta}>No upcoming fixtures yet. Tap + to add one.</Text>
                )}
              </View>
            </View>

            <View style={styles.homeSectionCard}>
              <View style={styles.homeSectionTitleRow}>
                <Text style={styles.homeSectionTitle}>Upcoming NSMQ Trials</Text>
                <Text style={styles.muted}>{trialPosts.length}</Text>
              </View>
              {trialPosts.length === 0 ? (
                <Text style={styles.muted}>No trials posted yet. Tap + to add one.</Text>
              ) : (
                trialPosts.map((post) => (
                  <HomeSectionPostCard
                    key={post.id}
                    post={post}
                    canDelete={isAdmin || (currentUser && currentUser.id === post.userId)}
                    onDelete={() => deleteHomePost(post.id)}
                  />
                ))
              )}
            </View>

            <View style={styles.homeSectionCard}>
              <View style={styles.homeSectionTitleRow}>
                <Text style={styles.homeSectionTitle}>Announcements</Text>
                <Text style={styles.muted}>{announcePosts.length}</Text>
              </View>
              {announcePosts.length === 0 ? (
                <Text style={styles.muted}>No announcements yet. Tap + to add one.</Text>
              ) : (
                announcePosts.map((post) => (
                  <HomeSectionPostCard
                    key={post.id}
                    post={post}
                    canDelete={isAdmin || (currentUser && currentUser.id === post.userId)}
                    onDelete={() => deleteHomePost(post.id)}
                  />
                ))
              )}
            </View>

            <View style={styles.homeSectionCard}>
              <View style={styles.homeSectionTitleRow}>
                <Text style={styles.homeSectionTitle}>Events and Fixtures</Text>
                <Text style={styles.muted}>{fixturePosts.length}</Text>
              </View>
              {fixturePosts.length === 0 ? (
                <Text style={styles.muted}>No events posted yet. Tap + to add one.</Text>
              ) : (
                fixturePosts.map((post) => (
                  <HomeSectionPostCard
                    key={post.id}
                    post={post}
                    canDelete={isAdmin || (currentUser && currentUser.id === post.userId)}
                    onDelete={() => deleteHomePost(post.id)}
                  />
                ))
              )}
            </View>

            {/* Full-page new post / assign task modal */}
            <Modal
              visible={showHomePostForm}
              animationType="slide"
              presentationStyle="pageSheet"
              onRequestClose={() => { setShowHomePostForm(false); setHomeFormMode('post'); setAdminTaskStatus('') }}
            >
              <SafeAreaView style={styles.addPageSafe} edges={['top', 'left', 'right']}>
                {/* Page header */}
                <View style={styles.addPageHeader}>
                  <Pressable
                    style={styles.addPageBack}
                    onPress={() => { setShowHomePostForm(false); setHomeFormMode('post'); setAdminTaskStatus('') }}
                  >
                    <Ionicons name="arrow-back" size={22} color="#0b2236" />
                  </Pressable>
                  <Text style={styles.addPageTitle}>
                    {homeFormMode === 'task' ? 'Assign Task' : 'New Post'}
                  </Text>
                  <View style={{ width: 38 }} />
                </View>

                {/* Admin mode toggle */}
                {isAdmin && (
                  <View style={styles.addPageModeRow}>
                    {['post', 'task'].map((mode) => (
                      <Pressable
                        key={mode}
                        style={[styles.addPageModePill, homeFormMode === mode && styles.addPageModePillActive]}
                        onPress={() => { setHomeFormMode(mode); setAdminTaskStatus('') }}
                      >
                        <Ionicons
                          name={mode === 'task' ? 'checkbox-outline' : 'megaphone-outline'}
                          size={15}
                          color={homeFormMode === mode ? '#fff' : '#36536b'}
                          style={{ marginRight: 6 }}
                        />
                        <Text style={[styles.addPageModeText, homeFormMode === mode && styles.addPageModeTextActive]}>
                          {mode === 'task' ? 'Assign Task' : 'Post'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                <ScrollView contentContainerStyle={styles.addPageScroll} keyboardShouldPersistTaps="handled">
                  {homeFormMode === 'post' ? (
                    <View style={styles.addPageCard}>
                      <Text style={styles.addPageSectionLabel}>Category</Text>
                      <View style={styles.homePostCategoryRow}>
                        {['Announcement', 'Trial Notice', 'Fixture', 'Update', 'Reminder'].map((cat) => (
                          <Pressable
                            key={cat}
                            style={[styles.homePostCategoryPill, homePostForm.category === cat && styles.homePostCategoryPillActive]}
                            onPress={() => setHomePostForm((prev) => ({ ...prev, category: cat }))}
                          >
                            <Text style={[styles.homePostCategoryText, homePostForm.category === cat && styles.homePostCategoryTextActive]}>
                              {cat}
                            </Text>
                          </Pressable>
                        ))}
                      </View>

                      <Input
                        label="What's happening?"
                        value={homePostForm.content}
                        onChangeText={(v) => setHomePostForm((prev) => ({ ...prev, content: v }))}
                        placeholder="Share an update, announcement, or notice with the squad..."
                        multiline
                      />

                      {homePostForm.imageUri ? (
                        <View style={styles.postImagePreviewWrap}>
                          <Image
                            source={{ uri: homePostForm.imageUri }}
                            style={styles.postImagePreview}
                            resizeMode="cover"
                          />
                          <Pressable
                            style={styles.postImageRemoveBtn}
                            onPress={() => setHomePostForm((prev) => ({ ...prev, imageUri: null }))}
                          >
                            <Ionicons name="close-circle" size={26} color="#fff" />
                          </Pressable>
                        </View>
                      ) : null}

                      <Pressable style={styles.postImagePickerBtn} onPress={pickPostImage}>
                        <Ionicons name="image-outline" size={18} color="#0f4c5c" />
                        <Text style={styles.postImagePickerBtnText}>
                          {homePostForm.imageUri ? 'Change Thumbnail' : 'Add Thumbnail'}
                        </Text>
                      </Pressable>

                      {homePostStatus ? <Text style={styles.muted}>{homePostStatus}</Text> : null}

                      <Pressable style={styles.addPageSubmitBtn} onPress={publishHomePost}>
                        {isSyncingHomePosts ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <Ionicons name="send-outline" size={17} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.addPageSubmitText}>Post to Homepage</Text>
                          </>
                        )}
                      </Pressable>
                    </View>
                  ) : (
                    <View style={styles.addPageCard}>
                      <Input
                        label="Task Title"
                        value={adminTaskForm.title}
                        onChangeText={(v) => setAdminTaskForm((p) => ({ ...p, title: v }))}
                        placeholder="e.g. Complete Chapter 5 past questions"
                      />
                      <Text style={styles.taskFormLabel}>Subject</Text>
                      <View style={styles.taskPillRow}>
                        {['Physics', 'Chemistry', 'Biology', 'Mathematics', 'GK', 'General'].map((s) => (
                          <Pressable
                            key={s}
                            style={[styles.taskPill, adminTaskForm.subject === s && { backgroundColor: getSubjectColor(s), borderColor: getSubjectColor(s) }]}
                            onPress={() => setAdminTaskForm((p) => ({ ...p, subject: s }))}
                          >
                            <Text style={[styles.taskPillText, adminTaskForm.subject === s && { color: '#fff' }]}>{s}</Text>
                          </Pressable>
                        ))}
                      </View>
                      <Text style={styles.taskFormLabel}>Priority</Text>
                      <View style={styles.taskPillRow}>
                        {['High', 'Medium', 'Low'].map((pr) => (
                          <Pressable
                            key={pr}
                            style={[styles.taskPill, adminTaskForm.priority === pr && { backgroundColor: PRIORITY_COLORS[pr], borderColor: PRIORITY_COLORS[pr] }]}
                            onPress={() => setAdminTaskForm((p) => ({ ...p, priority: pr }))}
                          >
                            <Text style={[styles.taskPillText, adminTaskForm.priority === pr && { color: '#fff' }]}>{pr}</Text>
                          </Pressable>
                        ))}
                      </View>
                      <Input
                        label="Due Date (optional)"
                        value={adminTaskForm.dueDate}
                        onChangeText={(v) => setAdminTaskForm((p) => ({ ...p, dueDate: v }))}
                        placeholder="e.g. Jun 15, 2026"
                      />
                      {adminTaskStatus ? <Text style={[styles.muted, { marginTop: 4 }]}>{adminTaskStatus}</Text> : null}
                      <Pressable style={styles.addPageSubmitBtn} onPress={publishAdminTask}>
                        {isPublishingAdminTask ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <Ionicons name="people-outline" size={17} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.addPageSubmitText}>Assign to All Users</Text>
                          </>
                        )}
                      </Pressable>
                    </View>
                  )}
                </ScrollView>
              </SafeAreaView>
            </Modal>

            <View style={styles.homeSectionCard}>
              <View style={styles.homeSectionTitleRow}>
                <Text style={styles.homeSectionTitle}>Community Posts</Text>
                <Text style={styles.muted}>{communityPosts.length} post{communityPosts.length !== 1 ? 's' : ''}</Text>
              </View>

              {communityPosts.length === 0 ? (
                <Text style={styles.muted}>No community posts yet. Tap + to be the first to post.</Text>
              ) : (
                communityPosts.map((post) => (
                  <View key={post.id} style={styles.homePostCard}>
                    {post.imageUrl ? (
                      <Image
                        source={{ uri: post.imageUrl }}
                        style={styles.postThumbnail}
                        resizeMode="cover"
                      />
                    ) : null}
                    <View style={styles.homePostCardBody}>
                      <View style={styles.homeItemTopRow}>
                        <Text style={styles.homePill}>{post.category}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={styles.muted}>{post.date}</Text>
                          {(isAdmin || (currentUser && currentUser.id === post.userId)) && (
                            <Pressable
                              onPress={() => deleteHomePost(post.id)}
                              hitSlop={8}
                              style={styles.postDeleteBtn}
                            >
                              <Ionicons name="trash-outline" size={15} color="#e63946" />
                            </Pressable>
                          )}
                        </View>
                      </View>
                      <Text style={styles.text}>{post.content}</Text>
                      <Text style={styles.focus}>By {post.author}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}

        {activePage === 'practice' && (
          <Card title="Practice Planner">
            {openedPracticeDayId ? (
              <View style={styles.practiceLayout}>
                <View style={styles.practiceDetailHeader}>
                  <Pressable
                    style={styles.practiceBackButton}
                    onPress={() => setOpenedPracticeDayId(null)}
                  >
                    <Text style={styles.practiceBackText}>Back To Days</Text>
                  </Pressable>
                  <Text style={styles.h3}>{currentDay.label}</Text>
                </View>

                <View style={styles.practiceTopTabs}>
                  {practiceSubjectTabs.map((subjectTab) => (
                    <Pressable
                      key={subjectTab}
                      style={[
                        styles.practiceTopTabButton,
                        selectedPracticeSubject === subjectTab &&
                          styles.practiceTopTabButtonActive,
                      ]}
                      onPress={() => setSelectedPracticeSubject(subjectTab)}
                    >
                      <Text
                        style={[
                          styles.practiceTopTabText,
                          selectedPracticeSubject === subjectTab &&
                            styles.practiceTopTabTextActive,
                        ]}
                      >
                        {subjectTab}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.practiceSubjectPage}>
                  <Text style={styles.h3}>
                    {currentDay.label} - {selectedPracticeSubject}
                  </Text>
                  <Text style={styles.workspaceSubtitle}>Fresh Page</Text>
                  <View style={styles.syncRow}>
                    <Text style={styles.syncText}>{practiceStatus}</Text>
                    {isSyncingPractice ? (
                      <ActivityIndicator size="small" color="#0f4c5c" />
                    ) : null}
                  </View>

                  {!showPracticeForm ? (
                    <Pressable
                      style={styles.practiceAddBtn}
                      onPress={() => setShowPracticeForm(true)}
                    >
                      <Ionicons name="add-circle-outline" size={18} color="#fff" />
                      <Text style={styles.practiceAddBtnText}>Add Question</Text>
                    </Pressable>
                  ) : (
                    <View style={styles.practiceFormCard}>
                      <View style={styles.practiceFormHeader}>
                        <Text style={styles.h3}>New Question</Text>
                        <Pressable
                          onPress={() => {
                            setShowPracticeForm(false)
                            setShowSymbolPicker(false)
                          }}
                        >
                          <Ionicons name="close" size={20} color="#36536b" />
                        </Pressable>
                      </View>

                      <Input
                        label="Question / Title"
                        value={practiceForm.title}
                        onChangeText={(v) => onChangePracticeForm('title', v)}
                        onFocus={() => setFocusedPracticeField('title')}
                        placeholder={`e.g. ${selectedPracticeSubject} Quiz Set 1`}
                      />
                      <Input
                        label="Question Details"
                        value={practiceForm.details}
                        onChangeText={(v) => onChangePracticeForm('details', v)}
                        onFocus={() => setFocusedPracticeField('details')}
                        placeholder="Write the full question or topic notes here."
                        multiline
                      />
                      <Input
                        label="Answer (short)"
                        value={practiceForm.answer}
                        onChangeText={(v) => onChangePracticeForm('answer', v)}
                        onFocus={() => setFocusedPracticeField('answer')}
                        placeholder="e.g. 42 m/s² or Option B"
                      />
                      <Input
                        label="Solution (step-by-step)"
                        value={practiceForm.solution}
                        onChangeText={(v) => onChangePracticeForm('solution', v)}
                        onFocus={() => setFocusedPracticeField('solution')}
                        placeholder="Show the full working or explanation here."
                        multiline
                      />

                      <Pressable
                        style={styles.symbolToggleBtn}
                        onPress={() => setShowSymbolPicker((prev) => !prev)}
                      >
                        <Ionicons name="calculator-outline" size={15} color="#0f4c5c" />
                        <Text style={styles.symbolToggleText}>
                          {showSymbolPicker ? 'Hide Symbols' : 'Insert Symbol'}
                        </Text>
                      </Pressable>

                      {showSymbolPicker && (
                        <View style={styles.symbolPickerWrap}>
                          <View style={styles.symbolCategoryRow}>
                            {SYMBOL_CATEGORIES.map((cat) => (
                              <Pressable
                                key={cat.key}
                                style={[
                                  styles.symbolCategoryPill,
                                  symbolCategoryTab === cat.key && styles.symbolCategoryPillActive,
                                ]}
                                onPress={() => setSymbolCategoryTab(cat.key)}
                              >
                                <Text
                                  style={[
                                    styles.symbolCategoryText,
                                    symbolCategoryTab === cat.key && styles.symbolCategoryTextActive,
                                  ]}
                                >
                                  {cat.label}
                                </Text>
                              </Pressable>
                            ))}
                          </View>
                          <Text style={styles.symbolHint}>
                            Inserting into: <Text style={styles.symbolHintField}>{focusedPracticeField}</Text>
                          </Text>
                          <View style={styles.symbolGridInner}>
                            {SYMBOL_CATEGORIES.find((c) => c.key === symbolCategoryTab)?.symbols.map((sym, i) => (
                              <Pressable
                                key={`${sym}-${i}`}
                                style={styles.symbolBtn}
                                onPress={() => insertSymbol(sym)}
                              >
                                <Text style={styles.symbolBtnText}>{sym}</Text>
                              </Pressable>
                            ))}
                          </View>
                        </View>
                      )}

                      <Pressable style={styles.button} onPress={publishPracticeRecord}>
                        {isSyncingPractice ? (
                          <ActivityIndicator size="small" color="#1f2937" />
                        ) : (
                          <Text style={styles.buttonText}>Save {selectedPracticeSubject} Question</Text>
                        )}
                      </Pressable>
                    </View>
                  )}

                  {scopedPracticeRecords.length === 0 ? (
                    <Text style={styles.text}>
                      No saved records yet for {currentDay.label} - {selectedPracticeSubject}.
                    </Text>
                  ) : (
                    <View style={styles.practiceRecordList}>
                      {scopedPracticeRecords.map((record) => (
                        <View key={`${record.id}-${record.dayId}-${record.subject}`} style={styles.practiceRecordCard}>
                          <Text style={styles.h3}>{record.title}</Text>
                          <Text style={styles.muted}>{record.date} | By {record.author}</Text>
                          {record.details ? <Text style={styles.text}>{record.details}</Text> : null}

                          <View style={styles.practiceRecordBtnRow}>
                            <Pressable
                              style={[
                                styles.practiceRecordBtn,
                                expandedPractice[record.id] === 'answer' && styles.practiceRecordBtnActive,
                              ]}
                              onPress={() =>
                                setExpandedPractice((prev) => ({
                                  ...prev,
                                  [record.id]: prev[record.id] === 'answer' ? null : 'answer',
                                }))
                              }
                            >
                              <Text
                                style={[
                                  styles.practiceRecordBtnText,
                                  expandedPractice[record.id] === 'answer' && styles.practiceRecordBtnTextActive,
                                ]}
                              >
                                Answer
                              </Text>
                            </Pressable>
                            <Pressable
                              style={[
                                styles.practiceRecordBtn,
                                expandedPractice[record.id] === 'solution' && styles.practiceRecordBtnActive,
                              ]}
                              onPress={() =>
                                setExpandedPractice((prev) => ({
                                  ...prev,
                                  [record.id]: prev[record.id] === 'solution' ? null : 'solution',
                                }))
                              }
                            >
                              <Text
                                style={[
                                  styles.practiceRecordBtnText,
                                  expandedPractice[record.id] === 'solution' && styles.practiceRecordBtnTextActive,
                                ]}
                              >
                                Solution
                              </Text>
                            </Pressable>
                          </View>

                          {expandedPractice[record.id] === 'answer' && record.answer ? (
                            <View style={styles.practiceExpandBox}>
                              <Text style={styles.practiceExpandLabel}>Answer</Text>
                              <Text style={styles.text}>{record.answer}</Text>
                            </View>
                          ) : null}

                          {expandedPractice[record.id] === 'solution' && record.solution ? (
                            <View style={styles.practiceExpandBox}>
                              <Text style={styles.practiceExpandLabel}>Solution</Text>
                              <Text style={styles.text}>{record.solution}</Text>
                            </View>
                          ) : null}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.muted}>
                  Select any day tab from Day One to Day Forty. Clicking a day opens a fresh
                  screen with top subject tabs.
                </Text>

                <View style={styles.practiceLayout}>
                  <View style={styles.practiceTabRailFull}>
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.practiceColumn}
                    >
                      {practiceDays.map((day) => (
                        <Pressable
                          key={day.id}
                          style={[styles.dayPill, selectedDay === day.id && styles.dayPillActive]}
                          onPress={() => {
                            setSelectedDay(day.id)
                            setOpenedPracticeDayId(day.id)
                            setSelectedPracticeSubject('Physics')
                          }}
                        >
                          <Text
                            style={[
                              styles.dayPillTitle,
                              selectedDay === day.id && styles.dayPillTitleActive,
                            ]}
                          >
                            {day.label}
                          </Text>
                          <Text
                            style={[
                              styles.dayPillMeta,
                              selectedDay === day.id && styles.dayPillMetaActive,
                            ]}
                          >
                            {day.date}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </>
            )}
          </Card>
        )}

        {activePage === 'entry' && (
          <>
            <View style={styles.resourcesIntroCard}>
              <Text style={styles.resourcesIntroTitle}>Study Resources</Text>
              <Text style={styles.muted}>Tap a subject to browse documents, books, and materials. Sign in to add resources.</Text>
            </View>

            {RESOURCE_SUBJECTS.map(({ name, icon, color }) => {
              const subjectResources = resources.filter((r) => r.subject === name)
              const isExpanded = expandedSubject === name
              const isFormOpen = showResourceForm === name
              return (
                <View key={name} style={styles.resourceSubjectCard}>
                  <Pressable
                    style={[styles.resourceSubjectHeader, { borderLeftColor: color }]}
                    onPress={() => {
                      setExpandedSubject(isExpanded ? null : name)
                      if (isExpanded) setShowResourceForm(null)
                    }}
                  >
                    <View style={styles.resourceSubjectHeaderLeft}>
                      <View style={[styles.resourceSubjectIconWrap, { backgroundColor: color + '22' }]}>
                        <Ionicons name={icon} size={20} color={color} />
                      </View>
                      <View>
                        <Text style={[styles.resourceSubjectName, { color }]}>{name}</Text>
                        <Text style={styles.resourceSubjectCount}>
                          {subjectResources.length} {subjectResources.length === 1 ? 'resource' : 'resources'}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color="#4f7187" />
                  </Pressable>

                  {isExpanded && (
                    <View style={styles.resourceSubjectBody}>
                      {subjectResources.length === 0 ? (
                        <Text style={styles.muted}>No resources yet. Add the first one!</Text>
                      ) : (
                        subjectResources.map((res) => {
                          const ytId = getYouTubeVideoId(res.url)
                          const isYouTube = Boolean(ytId)
                          const typeIcon = RESOURCE_TYPE_ICONS[res.fileType] || 'document-outline'
                          return (
                            <Pressable
                              key={res.id}
                              style={[styles.resourceItem, isYouTube && styles.resourceItemVideo]}
                              onPress={res.url ? () => openResource(res.url) : undefined}
                            >
                              {isYouTube && (
                                <View style={styles.resourceThumbWrap}>
                                  <Image
                                    source={{ uri: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` }}
                                    style={styles.resourceThumb}
                                    resizeMode="cover"
                                  />
                                  <View style={styles.resourcePlayOverlay}>
                                    <Ionicons name="play-circle" size={44} color="#fff" />
                                  </View>
                                </View>
                              )}
                              <View style={[isYouTube && styles.resourceVideoBody]}>
                                <View style={styles.resourceItemTop}>
                                  <View style={[styles.resourceTypeBadge, { backgroundColor: color + '22' }]}>
                                    <Ionicons name={typeIcon} size={12} color={color} style={{ marginRight: 4 }} />
                                    <Text style={[styles.resourceTypeBadgeText, { color }]}>{res.fileType}</Text>
                                  </View>
                                  <Text style={styles.muted}>{res.date}</Text>
                                </View>
                                <Text style={styles.h3}>{res.title}</Text>
                                {res.description ? <Text style={styles.text}>{res.description}</Text> : null}
                                <Text style={styles.focus}>By {res.author}</Text>
                                {res.url && !isYouTube ? (
                                  <View style={[styles.resourceOpenBtn, { borderColor: color }]}>
                                    <Ionicons name={typeIcon} size={14} color={color} />
                                    <Text style={[styles.resourceOpenBtnText, { color }]}>Open / Read</Text>
                                  </View>
                                ) : null}
                                {isYouTube ? (
                                  <View style={[styles.resourceOpenBtn, { borderColor: color }]}>
                                    <Ionicons name="play-outline" size={14} color={color} />
                                    <Text style={[styles.resourceOpenBtnText, { color }]}>Watch Video</Text>
                                  </View>
                                ) : null}
                              </View>
                            </Pressable>
                          )
                        })
                      )}

                      {!isFormOpen ? (
                        <Pressable
                          style={[styles.resourceAddBtn, { backgroundColor: color }]}
                          onPress={() => setShowResourceForm(name)}
                        >
                          <Ionicons name="add-circle-outline" size={16} color="#fff" />
                          <Text style={styles.resourceAddBtnText}>Add {name} Resource</Text>
                        </Pressable>
                      ) : (
                        <View style={styles.resourceFormCard}>
                          <View style={styles.resourceFormHeader}>
                            <Text style={styles.h3}>New {name} Resource</Text>
                            <Pressable onPress={() => {
                              setShowResourceForm(null)
                              setResourceForm({ title: '', url: '', fileType: 'Document', description: '' })
                            }}>
                              <Ionicons name="close" size={20} color="#36536b" />
                            </Pressable>
                          </View>
                          <Input
                            label="Title"
                            value={resourceForm.title}
                            onChangeText={(v) => setResourceForm((p) => ({ ...p, title: v }))}
                            placeholder="e.g. Waves and Optics Notes"
                          />
                          <Input
                            label="URL / Link"
                            value={resourceForm.url}
                            onChangeText={(v) => setResourceForm((p) => ({ ...p, url: v }))}
                            placeholder="https://drive.google.com/..."
                          />
                          <Input
                            label="Description (optional)"
                            value={resourceForm.description}
                            onChangeText={(v) => setResourceForm((p) => ({ ...p, description: v }))}
                            placeholder="Brief description of this resource"
                            multiline
                          />
                          <View style={styles.resourceTypeSection}>
                            <Text style={styles.label}>Type</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                              <View style={styles.resourceTypeScroll}>
                                {RESOURCE_TYPES.map((type) => (
                                  <Pressable
                                    key={type}
                                    style={[
                                      styles.resourceTypePill,
                                      resourceForm.fileType === type && { backgroundColor: color, borderColor: color },
                                    ]}
                                    onPress={() => setResourceForm((p) => ({ ...p, fileType: type }))}
                                  >
                                    <Text
                                      style={[
                                        styles.resourceTypePillText,
                                        resourceForm.fileType === type && { color: '#fff' },
                                      ]}
                                    >
                                      {type}
                                    </Text>
                                  </Pressable>
                                ))}
                              </View>
                            </ScrollView>
                          </View>
                          {resourceStatus ? <Text style={styles.muted}>{resourceStatus}</Text> : null}
                          <Pressable
                            style={[styles.button, { backgroundColor: color }]}
                            onPress={() => publishResource(name)}
                          >
                            {isSyncingResources ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <Text style={styles.buttonText}>Save Resource</Text>
                            )}
                          </Pressable>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )
            })}
          </>
        )}

        {activePage === 'leaderboard' && (
            <Card title="Student Leaderboard">
              <View style={styles.syncRow}>
                <Text style={styles.syncText}>{leaderboardStatus}</Text>
                {isSyncingLeaderboard ? (
                  <ActivityIndicator size="small" color="#0f4c5c" />
                ) : null}
                {isAdmin && (
                  <Pressable
                    style={[styles.button, { marginLeft: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', height: 32 }]}
                    onPress={() => setShowLeaderboardModal(true)}
                    accessibilityLabel="Add leaderboard entry"
                  >
                    <Ionicons name="add-circle" size={20} color="#fff" style={{ marginRight: 4 }} />
                    <Text style={styles.buttonText}>Add</Text>
                  </Pressable>
                )}
              </View>

              {/* Category filter buttons */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 8 }}>
                <Pressable
                  style={[
                    styles.button,
                    { marginRight: 8, backgroundColor: selectedLeaderboardCategory === 'main' ? '#0f4c5c' : '#b0bec5' },
                  ]}
                  onPress={() => setSelectedLeaderboardCategory('main')}
                >
                  <Text style={styles.buttonText}>Main Category</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.button,
                    { backgroundColor: selectedLeaderboardCategory === 'substitute' ? '#0f4c5c' : '#b0bec5' },
                  ]}
                  onPress={() => setSelectedLeaderboardCategory('substitute')}
                >
                  <Text style={styles.buttonText}>Substitute Category</Text>
                </Pressable>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
                {subjects.map((subject) => (
                  <Pressable
                    key={subject}
                    style={[styles.tab, selectedSubject === subject && styles.tabActive]}
                    onPress={() => setSelectedSubject(subject)}
                  >
                    <Text style={[styles.tabText, selectedSubject === subject && styles.tabTextActive]}>{subject}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              {sortedLeaderboard
                .filter((student) => (student.category || 'main') === selectedLeaderboardCategory)
                .map((student, idx) => (
                  <View key={student.student} style={styles.scoreRow}>
                    <Text style={styles.rank}>#{idx + 1}</Text>
                    <View style={styles.rankBody}>
                      <Text style={styles.h3}>{student.student}</Text>
                      <Text style={styles.text}>
                        Overall {student.overall}% | Phy {student.Physics}% | Chem {student.Chemistry}% | Bio {student.Biology}% | Math {student.Mathematics}% | GK {student.GK}%
                      </Text>
                    </View>
                  </View>
                ))}

              <Modal
                visible={showLeaderboardModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => { setShowLeaderboardModal(false); setSaveError('') }}
              >
                <View style={styles.lbModalOverlay}>
                  <View style={styles.lbModalCard}>
                    <View style={styles.lbModalHeader}>
                      <Text style={styles.h2}>Update Score</Text>
                      <Pressable onPress={() => { setShowLeaderboardModal(false); setSaveError('') }}>
                        <Ionicons name="close" size={22} color="#36536b" />
                      </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
                      {/* Quick-select existing student */}
                      <Text style={styles.lbPickerLabel}>Tap a student to pre-fill</Text>
                      <View style={styles.lbPickerRow}>
                        {leaderboardRows.map((row) => (
                          <Pressable
                            key={row.student}
                            style={[
                              styles.lbPickerPill,
                              newLeaderboard.student === row.student && styles.lbPickerPillActive,
                            ]}
                            onPress={() => setNewLeaderboard({
                              student: row.student,
                              overall: String(row.overall),
                              Physics: String(row.Physics),
                              Chemistry: String(row.Chemistry),
                              Biology: String(row.Biology),
                              Mathematics: String(row.Mathematics),
                              GK: String(row.GK),
                              category: row.category || 'main',
                            })}
                          >
                            <Text style={[styles.lbPickerPillText, newLeaderboard.student === row.student && { color: '#fff' }]}>
                              {row.student}
                            </Text>
                          </Pressable>
                        ))}
                      </View>

                      <Input
                        label="Student Name"
                        value={newLeaderboard.student}
                        onChangeText={v => setNewLeaderboard(n => ({ ...n, student: v }))}
                        placeholder="Full name"
                      />

                      {/* Category */}
                      <Text style={styles.lbPickerLabel}>Category</Text>
                      <View style={styles.lbCatRow}>
                        {['main', 'substitute'].map((cat) => (
                          <Pressable
                            key={cat}
                            style={[styles.lbCatPill, newLeaderboard.category === cat && styles.lbCatPillActive]}
                            onPress={() => setNewLeaderboard(n => ({ ...n, category: cat }))}
                          >
                            <Text style={[styles.lbCatText, newLeaderboard.category === cat && { color: '#fff' }]}>
                              {cat === 'main' ? 'Main' : 'Substitute'}
                            </Text>
                          </Pressable>
                        ))}
                      </View>

                      <Input label="Overall %" value={newLeaderboard.overall} onChangeText={v => setNewLeaderboard(n => ({ ...n, overall: v }))} placeholder="0–100" />
                      <Input label="Physics %" value={newLeaderboard.Physics} onChangeText={v => setNewLeaderboard(n => ({ ...n, Physics: v }))} placeholder="0–100" />
                      <Input label="Chemistry %" value={newLeaderboard.Chemistry} onChangeText={v => setNewLeaderboard(n => ({ ...n, Chemistry: v }))} placeholder="0–100" />
                      <Input label="Biology %" value={newLeaderboard.Biology} onChangeText={v => setNewLeaderboard(n => ({ ...n, Biology: v }))} placeholder="0–100" />
                      <Input label="Mathematics %" value={newLeaderboard.Mathematics} onChangeText={v => setNewLeaderboard(n => ({ ...n, Mathematics: v }))} placeholder="0–100" />
                      <Input label="General Knowledge %" value={newLeaderboard.GK} onChangeText={v => setNewLeaderboard(n => ({ ...n, GK: v }))} placeholder="0–100" />

                      {saveError ? <Text style={{ color: '#e63946', marginTop: 4, fontSize: 13 }}>{saveError}</Text> : null}
                    </ScrollView>

                    <View style={styles.lbModalBtns}>
                      <Pressable
                        style={[styles.taskCancelBtn, { flex: 1, marginRight: 8 }]}
                        onPress={() => { setShowLeaderboardModal(false); setSaveError('') }}
                      >
                        <Text style={styles.taskCancelBtnText}>Cancel</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.button, { flex: 1 }, isSavingLeaderboard && { opacity: 0.6 }]}
                        disabled={isSavingLeaderboard}
                        onPress={async () => {
                          setIsSavingLeaderboard(true)
                          setSaveError('')
                          const scoreFields = ['overall', 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'GK']
                          if (!newLeaderboard.student.trim()) {
                            setSaveError('Student name is required.')
                            setIsSavingLeaderboard(false)
                            return
                          }
                          for (const key of scoreFields) {
                            const val = parseInt(newLeaderboard[key], 10)
                            if (isNaN(val) || val < 0 || val > 100) {
                              setSaveError(`${key} must be 0–100.`)
                              setIsSavingLeaderboard(false)
                              return
                            }
                          }
                          const payload = {
                            student: newLeaderboard.student.trim(),
                            overall: parseInt(newLeaderboard.overall, 10),
                            physics: parseInt(newLeaderboard.Physics, 10),
                            chemistry: parseInt(newLeaderboard.Chemistry, 10),
                            biology: parseInt(newLeaderboard.Biology, 10),
                            mathematics: parseInt(newLeaderboard.Mathematics, 10),
                            gk: parseInt(newLeaderboard.GK, 10),
                            category: newLeaderboard.category,
                          }
                          const isExisting = leaderboardRows.some(r => r.student === payload.student)
                          try {
                            let data, error
                            if (isExisting) {
                              ;({ data, error } = await supabase
                                .from('leaderboard_scores')
                                .update(payload)
                                .eq('student', payload.student)
                                .select('student,overall,physics,chemistry,biology,mathematics,gk,category')
                                .single())
                            } else {
                              ;({ data, error } = await supabase
                                .from('leaderboard_scores')
                                .insert(payload)
                                .select('student,overall,physics,chemistry,biology,mathematics,gk,category')
                                .single())
                            }
                            if (error) { setSaveError(error.message || 'Failed to save.'); setIsSavingLeaderboard(false); return }
                            const mapped = mapSupabaseLeaderboard(data)
                            setLeaderboardRows(prev =>
                              isExisting
                                ? prev.map(r => r.student === mapped.student ? mapped : r)
                                : [...prev, mapped],
                            )
                            setShowLeaderboardModal(false)
                            setNewLeaderboard({ student: '', overall: '', Physics: '', Chemistry: '', Biology: '', Mathematics: '', GK: '', category: 'main' })
                          } catch {
                            setSaveError('Unexpected error.')
                          }
                          setIsSavingLeaderboard(false)
                        }}
                      >
                        <Text style={styles.buttonText}>{isSavingLeaderboard ? 'Saving…' : (leaderboardRows.some(r => r.student === newLeaderboard.student.trim()) ? 'Update' : 'Add')}</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Modal>
            </Card>
        )}

        {activePage === 'profile' && (
          <>
            <Card title="Account Access">
              <View style={styles.syncRow}>
                <Text style={styles.syncText}>{authStatus}</Text>
                {isAuthBusy ? (
                  <ActivityIndicator size="small" color="#0f4c5c" />
                ) : null}
              </View>

              {isSupabaseConfigured ? (
                currentUser ? (
                  <View style={styles.authSignedRow}>
                    <Text style={styles.text}>Signed in as {getUserDisplayName(currentUser)}</Text>
                    <Pressable style={styles.authButton} onPress={handleSignOut}>
                      <Text style={styles.authButtonText}>Sign Out</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.authFormWrap}>
                    <View style={styles.authModeRow}>
                      <Pressable
                        style={[styles.authModePill, authMode === 'signIn' && styles.authModePillActive]}
                        onPress={() => setAuthMode('signIn')}
                      >
                        <Text
                          style={[
                            styles.authModeText,
                            authMode === 'signIn' && styles.authModeTextActive,
                          ]}
                        >
                          Sign In
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[styles.authModePill, authMode === 'signUp' && styles.authModePillActive]}
                        onPress={() => setAuthMode('signUp')}
                      >
                        <Text
                          style={[
                            styles.authModeText,
                            authMode === 'signUp' && styles.authModeTextActive,
                          ]}
                        >
                          Create Account
                        </Text>
                      </Pressable>
                    </View>

                    {authMode === 'signUp' ? (
                      <>
                        <Input
                          label="Full Name"
                          value={authForm.fullName}
                          onChangeText={(v) => handleAuthFieldChange('fullName', v)}
                          placeholder="e.g. Nana Kofi Asare"
                        />
                        <Text style={styles.taskFormLabel}>I am joining as a</Text>
                        <View style={styles.taskPillRow}>
                          {['student', 'trainer'].map((r) => (
                            <Pressable
                              key={r}
                              style={[
                                styles.taskPill,
                                authForm.role === r && { backgroundColor: '#0f4c5c', borderColor: '#0f4c5c' },
                              ]}
                              onPress={() => handleAuthFieldChange('role', r)}
                            >
                              <Text style={[styles.taskPillText, authForm.role === r && { color: '#fff' }]}>
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </>
                    ) : null}
                    <Input
                      label="Email"
                      value={authForm.email}
                      onChangeText={(v) => handleAuthFieldChange('email', v)}
                      placeholder="student@email.com"
                    />
                    <Input
                      label="Password"
                      value={authForm.password}
                      onChangeText={(v) => handleAuthFieldChange('password', v)}
                      placeholder="Enter password"
                      secureTextEntry
                    />

                    <Pressable style={styles.authButton} onPress={handleAuthSubmit}>
                      <Text style={styles.authButtonText}>
                        {authMode === 'signUp' ? 'Create Account' : 'Sign In'}
                      </Text>
                    </Pressable>
                  </View>
                )
              ) : (
                <Text style={styles.muted}>Add Supabase keys in .env to enable account access.</Text>
              )}
            </Card>

            {!isTrainer && (
            <>
            <Card title="Task Tracker">
              {/* Summary stats */}
              <View style={styles.taskSummaryRow}>
                {[
                  { label: 'Total', value: tasks.length, color: '#0f4c5c' },
                  { label: 'Pending', value: tasks.filter((t) => !t.done).length, color: '#e63946' },
                  { label: 'Done', value: tasks.filter((t) => t.done).length, color: '#2d6a4f' },
                ].map((s) => (
                  <View key={s.label} style={styles.taskStat}>
                    <Text style={[styles.taskStatNum, { color: s.color }]}>{s.value}</Text>
                    <Text style={styles.taskStatLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>

              {/* Progress bar */}
              <View style={styles.progressHead}>
                <Text style={styles.text}>Overall Completion</Text>
                <Text style={styles.text}>{tasks.length > 0 ? Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100) : 0}%</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${tasks.length > 0 ? Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100) : 0}%` }]} />
              </View>

              {/* Filter tabs */}
              <View style={styles.taskFilterRow}>
                {['all', 'pending', 'done'].map((f) => (
                  <Pressable
                    key={f}
                    style={[styles.taskFilterPill, taskFilter === f && styles.taskFilterPillActive]}
                    onPress={() => setTaskFilter(f)}
                  >
                    <Text style={[styles.taskFilterText, taskFilter === f && styles.taskFilterTextActive]}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Task list */}
              {tasks
                .filter((t) => taskFilter === 'done' ? t.done : taskFilter === 'pending' ? !t.done : true)
                .map((task) => (
                  <View key={task.id} style={[styles.taskItem, task.done && styles.taskItemDone]}>
                    <Pressable onPress={() => toggleTask(task.id)}>
                      <Ionicons name={task.done ? 'checkmark-circle' : 'ellipse-outline'} size={26} color={task.done ? '#2d6a4f' : '#b0bec5'} />
                    </Pressable>
                    <View style={styles.taskBody}>
                      <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]}>{task.title}</Text>
                      <View style={styles.taskMeta}>
                        {task.source === 'admin' && (
                          <View style={[styles.taskBadge, { backgroundColor: '#0f4c5c' }]}>
                            <Text style={[styles.taskBadgeText, { color: '#fff' }]}>Admin</Text>
                          </View>
                        )}
                        <View style={[styles.taskBadge, { backgroundColor: PRIORITY_COLORS[task.priority] + '22' }]}>
                          <Text style={[styles.taskBadgeText, { color: PRIORITY_COLORS[task.priority] }]}>{task.priority}</Text>
                        </View>
                        <View style={[styles.taskBadge, { backgroundColor: getSubjectColor(task.subject) + '18' }]}>
                          <Text style={[styles.taskBadgeText, { color: getSubjectColor(task.subject) }]}>{task.subject}</Text>
                        </View>
                        {task.dueDate ? <Text style={styles.taskDue}>Due: {task.dueDate}</Text> : null}
                      </View>
                    </View>
                    <Pressable onPress={() => deleteTask(task.id)}>
                      <Ionicons name="trash-outline" size={18} color="#c9d6df" />
                    </Pressable>
                  </View>
                ))}
              {tasks.filter((t) => taskFilter === 'done' ? t.done : taskFilter === 'pending' ? !t.done : true).length === 0 && (
                <Text style={styles.muted}>{taskFilter === 'done' ? 'No completed tasks yet.' : 'No pending tasks.'}</Text>
              )}

              {/* Add task form */}
              {showTaskForm ? (
                <View style={styles.taskForm}>
                  <Input
                    label="Task Title"
                    value={taskForm.title}
                    onChangeText={(v) => setTaskForm((p) => ({ ...p, title: v }))}
                    placeholder="e.g. Revise Electrostatics chapter"
                  />
                  <Text style={styles.taskFormLabel}>Subject</Text>
                  <View style={styles.taskPillRow}>
                    {['Physics', 'Chemistry', 'Biology', 'Mathematics', 'GK', 'General'].map((s) => (
                      <Pressable
                        key={s}
                        style={[styles.taskPill, taskForm.subject === s && { backgroundColor: getSubjectColor(s), borderColor: getSubjectColor(s) }]}
                        onPress={() => setTaskForm((p) => ({ ...p, subject: s }))}
                      >
                        <Text style={[styles.taskPillText, taskForm.subject === s && { color: '#fff' }]}>{s}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={styles.taskFormLabel}>Priority</Text>
                  <View style={styles.taskPillRow}>
                    {['High', 'Medium', 'Low'].map((pr) => (
                      <Pressable
                        key={pr}
                        style={[styles.taskPill, taskForm.priority === pr && { backgroundColor: PRIORITY_COLORS[pr], borderColor: PRIORITY_COLORS[pr] }]}
                        onPress={() => setTaskForm((p) => ({ ...p, priority: pr }))}
                      >
                        <Text style={[styles.taskPillText, taskForm.priority === pr && { color: '#fff' }]}>{pr}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Input
                    label="Due Date (optional)"
                    value={taskForm.dueDate}
                    onChangeText={(v) => setTaskForm((p) => ({ ...p, dueDate: v }))}
                    placeholder="e.g. Jun 15, 2026"
                  />
                  <View style={styles.taskFormBtns}>
                    <Pressable style={[styles.button, { flex: 1, marginRight: 8 }]} onPress={addTask}>
                      <Text style={styles.buttonText}>Add Task</Text>
                    </Pressable>
                    <Pressable style={[styles.taskCancelBtn, { flex: 1 }]} onPress={() => setShowTaskForm(false)}>
                      <Text style={styles.taskCancelBtnText}>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable style={styles.addItemBtn} onPress={() => setShowTaskForm(true)}>
                  <Ionicons name="add-circle-outline" size={16} color="#0f4c5c" />
                  <Text style={styles.addItemBtnText}>Add Task</Text>
                </Pressable>
              )}
            </Card>

            <Card title="My Notes">
              {notes.map((note) => (
                <View key={note.id} style={styles.noteItem}>
                  <Pressable
                    style={styles.noteHeader}
                    onPress={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.noteTitle}>{note.title}</Text>
                      <Text style={styles.noteDate}>{note.createdAt}</Text>
                    </View>
                    <Pressable onPress={() => deleteNote(note.id)} style={{ marginRight: 10 }}>
                      <Ionicons name="trash-outline" size={16} color="#c9d6df" />
                    </Pressable>
                    <Ionicons name={expandedNote === note.id ? 'chevron-up' : 'chevron-down'} size={16} color="#4f7187" />
                  </Pressable>
                  {expandedNote === note.id && (
                    <View style={styles.noteBody}>
                      <Text style={styles.noteContent}>{note.content || 'No content.'}</Text>
                    </View>
                  )}
                </View>
              ))}
              {notes.length === 0 && !showNoteForm && (
                <Text style={styles.muted}>No notes yet. Tap below to write your first note.</Text>
              )}

              {showNoteForm ? (
                <View style={styles.taskForm}>
                  <Input
                    label="Title"
                    value={noteForm.title}
                    onChangeText={(v) => setNoteForm((p) => ({ ...p, title: v }))}
                    placeholder="Note title..."
                  />
                  <Input
                    label="Content"
                    value={noteForm.content}
                    onChangeText={(v) => setNoteForm((p) => ({ ...p, content: v }))}
                    placeholder="Write your note here..."
                    multiline
                  />
                  <View style={styles.taskFormBtns}>
                    <Pressable style={[styles.button, { flex: 1, marginRight: 8 }]} onPress={addNote}>
                      <Text style={styles.buttonText}>Save Note</Text>
                    </Pressable>
                    <Pressable style={[styles.taskCancelBtn, { flex: 1 }]} onPress={() => setShowNoteForm(false)}>
                      <Text style={styles.taskCancelBtnText}>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable style={styles.addItemBtn} onPress={() => setShowNoteForm(true)}>
                  <Ionicons name="create-outline" size={16} color="#0f4c5c" />
                  <Text style={styles.addItemBtnText}>New Note</Text>
                </Pressable>
              )}
            </Card>
            </>
            )}

            <Card title="Weekly Goal Completion">
              <View style={styles.progressHead}>
                <Text style={styles.text}>Completion</Text>
                <Text style={styles.text}>{goalProgress}%</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${goalProgress}%` }]} />
              </View>
              {goalChecks.map((goalItem, index) => (
                <Pressable key={goalItem.goal} style={styles.goalRow} onPress={() => toggleGoal(index)}>
                  <View style={[styles.checkbox, goalItem.done && styles.checkboxDone]} />
                  <Text style={styles.text}>{goalItem.goal}</Text>
                </Pressable>
              ))}
            </Card>

            <Card title="Subject Progress Snapshot">
              <Text style={styles.muted}>Squad average scores from the leaderboard.</Text>
              {[
                { subject: 'Physics', key: 'Physics' },
                { subject: 'Chemistry', key: 'Chemistry' },
                { subject: 'Biology', key: 'Biology' },
                { subject: 'Mathematics', key: 'Mathematics' },
                { subject: 'General Knowledge', key: 'GK' },
              ].map((item) => {
                const level = subjectAverages[item.key] ?? 0
                return (
                  <View key={item.subject} style={styles.progressBlock}>
                    <View style={styles.progressHead}>
                      <Text style={styles.text}>{item.subject}</Text>
                      <Text style={styles.text}>{level}%</Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${level}%` }]} />
                    </View>
                  </View>
                )
              })}
            </Card>
          </>
        )}
      </ScrollView>

      <View style={[styles.bottomNav, { bottom: 12 + insets.bottom }]}>
        {navigationItems.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.navButton, activePage === item.id && styles.navButtonActive]}
            onPress={() => setActivePage(item.id)}
          >
            <View style={styles.navIconWrap}>
              <Ionicons
                name={activePage === item.id ? item.iconActive : item.icon}
                size={20}
                color={activePage === item.id ? '#0b2236' : '#53748a'}
              />
            </View>
            <Text style={[styles.navText, activePage === item.id && styles.navTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {activePage === 'home' && (
        <Pressable
          style={[styles.fab, { bottom: 90 + insets.bottom }]}
          onPress={() => {
            if (showHomePostForm) {
              setShowHomePostForm(false)
              setHomeFormMode('post')
              setAdminTaskStatus('')
            } else {
              setShowHomePostForm(true)
            }
          }}
        >
          <Ionicons name={showHomePostForm ? 'close' : 'add'} size={28} color="#fff" />
        </Pressable>
      )}
    </SafeAreaView>
  )
}

function HomeSectionPostCard({ post, canDelete, onDelete }) {
  return (
    <View style={styles.homeSectionPost}>
      {post.imageUrl ? (
        <Image source={{ uri: post.imageUrl }} style={styles.homeSectionPostImage} resizeMode="cover" />
      ) : null}
      <View style={styles.homeSectionPostBody}>
        <View style={styles.homeItemTopRow}>
          <Text style={styles.muted}>{post.date} · {post.author}</Text>
          {canDelete && (
            <Pressable onPress={onDelete} hitSlop={8} style={styles.postDeleteBtn}>
              <Ionicons name="trash-outline" size={14} color="#e63946" />
            </Pressable>
          )}
        </View>
        <Text style={styles.text}>{post.content}</Text>
      </View>
    </View>
  )
}

function Card({ title, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.h2}>{title}</Text>
      <View style={styles.cardGap}>{children}</View>
    </View>
  )
}

function Input({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  editable = true,
  secureTextEntry = false,
  onFocus,
}) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        editable={editable}
        secureTextEntry={secureTextEntry}
        textAlignVertical={multiline ? 'top' : 'center'}
        onFocus={onFocus}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  bgTop: {
    position: 'absolute',
    top: -80,
    left: -30,
    width: 220,
    height: 220,
    borderRadius: 120,
    backgroundColor: 'rgba(142, 202, 230, 0.45)',
  },
  bgBottom: {
    position: 'absolute',
    bottom: 80,
    right: -50,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 183, 3, 0.35)',
  },
  container: {
    padding: 16,
    gap: 12,
  },
  headerCard: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.16)',
    borderRadius: 18,
    padding: 16,
    gap: 4,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#36536b',
    fontWeight: '700',
  },
  h1: {
    color: '#0b2236',
    fontSize: 22,
    fontWeight: '800',
  },
  h2: {
    color: '#0b2236',
    fontSize: 18,
    fontWeight: '800',
  },
  h3: {
    color: '#0b2236',
    fontSize: 15,
    fontWeight: '700',
  },
  text: {
    color: '#274458',
    fontSize: 14,
  },
  muted: {
    color: '#4f7187',
    fontSize: 13,
  },
  focus: {
    color: '#0f4c5c',
    fontWeight: '700',
    fontSize: 13,
  },
  listItem: {
    color: '#274458',
    fontSize: 14,
    marginBottom: 8,
  },
  homeHeroCard: {
    backgroundColor: '#0c263a',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#123b57',
    overflow: 'hidden',
  },
  homeHeroStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: '#ffb703',
  },
  homeHeroOverline: {
    color: '#9ec5dc',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.3,
    fontWeight: '700',
  },
  homeHeroTitle: {
    marginTop: 6,
    color: '#eef7ff',
    fontSize: 22,
    fontWeight: '800',
  },
  homeHeroSubtitle: {
    marginTop: 6,
    color: '#c5def0',
    fontSize: 14,
    lineHeight: 20,
  },
  statsRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    marginTop: 2,
    color: '#b4d2e8',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  fixtureSpotlight: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(10, 47, 74, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(158, 197, 220, 0.24)',
    gap: 3,
  },
  fixtureSpotlightLabel: {
    color: '#8ecae6',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  fixtureSpotlightTitle: {
    color: '#eef7ff',
    fontSize: 16,
    fontWeight: '800',
  },
  fixtureSpotlightMeta: {
    color: '#c5def0',
    fontSize: 13,
  },
  homeSectionCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.16)',
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  homeSectionTitle: {
    color: '#0b2236',
    fontSize: 17,
    fontWeight: '800',
  },
  homeSectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  homeItemCard: {
    borderWidth: 1,
    borderColor: 'rgba(20, 92, 132, 0.18)',
    borderRadius: 12,
    padding: 11,
    gap: 5,
    backgroundColor: '#fefefe',
  },
  homeItemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  homePill: {
    color: '#0f4c5c',
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: 'rgba(142, 202, 230, 0.25)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  announcementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  announcementDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    backgroundColor: '#219ebc',
  },
  announcementText: {
    color: '#274458',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.16)',
    borderRadius: 18,
    padding: 14,
  },
  cardGap: {
    marginTop: 10,
    gap: 10,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(142, 202, 230, 0.2)',
  },
  syncText: {
    color: '#0f4c5c',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  authSignedRow: {
    marginTop: 10,
    gap: 10,
  },
  authFormWrap: {
    marginTop: 10,
    gap: 10,
  },
  authModeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  authModePill: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.25)',
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  authModePillActive: {
    backgroundColor: '#0f4c5c',
    borderColor: '#0f4c5c',
  },
  authModeText: {
    color: '#36536b',
    fontSize: 12,
    fontWeight: '700',
  },
  authModeTextActive: {
    color: '#fff',
  },
  authButton: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#0f4c5c',
  },
  authButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  itemCard: {
    borderWidth: 1,
    borderColor: 'rgba(33,158,188,0.22)',
    borderRadius: 12,
    padding: 10,
    gap: 4,
    backgroundColor: '#ffffff',
  },
  tabRow: {
    gap: 8,
  },
  practiceColumn: {
    gap: 8,
    paddingBottom: 6,
  },
  practiceLayout: {
    marginTop: 6,
    gap: 10,
  },
  practiceTabRail: {
    maxHeight: 330,
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.14)',
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.88)',
    padding: 8,
  },
  practiceTabRailFull: {
    maxHeight: 430,
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.14)',
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.88)',
    padding: 8,
  },
  practiceDetailHeader: {
    gap: 8,
  },
  practiceBackButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(20, 92, 132, 0.24)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(142, 202, 230, 0.24)',
  },
  practiceBackText: {
    color: '#0f4c5c',
    fontWeight: '700',
    fontSize: 12,
  },
  practiceTopTabs: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  practiceTopTabButton: {
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.26)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
  },
  practiceTopTabButtonActive: {
    backgroundColor: '#0f4c5c',
    borderColor: '#0f4c5c',
  },
  practiceTopTabText: {
    color: '#36536b',
    fontWeight: '700',
    fontSize: 12,
  },
  practiceTopTabTextActive: {
    color: '#ffffff',
  },
  practiceSubjectPage: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(20, 92, 132, 0.2)',
    borderRadius: 13,
    padding: 12,
    gap: 6,
    backgroundColor: '#ffffff',
    minHeight: 180,
  },
  practiceRecordList: {
    marginTop: 6,
    gap: 8,
  },
  practiceRecordCard: {
    borderWidth: 1,
    borderColor: 'rgba(33,158,188,0.24)',
    borderRadius: 12,
    padding: 10,
    gap: 4,
    backgroundColor: '#fdfefe',
  },
  practiceWorkspace: {
    borderWidth: 1,
    borderColor: 'rgba(20, 92, 132, 0.2)',
    borderRadius: 13,
    padding: 12,
    gap: 6,
    backgroundColor: '#ffffff',
    minHeight: 150,
  },
  workspaceSubtitle: {
    color: '#0f4c5c',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  dayPill: {
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.28)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#fff',
  },
  dayPillActive: {
    backgroundColor: '#0f4c5c',
    borderColor: '#0f4c5c',
  },
  dayPillTitle: {
    color: '#0b2236',
    fontWeight: '800',
    fontSize: 13.5,
  },
  dayPillTitleActive: {
    color: '#ffffff',
  },
  dayPillMeta: {
    color: '#4f7187',
    fontSize: 12,
    fontWeight: '600',
  },
  dayPillMetaActive: {
    color: '#d9edf7',
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.3)',
    backgroundColor: '#fff',
  },
  tabActive: {
    backgroundColor: '#219ebc',
    borderColor: '#219ebc',
  },
  tabText: {
    color: '#0b2236',
    fontWeight: '700',
    fontSize: 13,
  },
  tabTextActive: {
    color: '#fff',
  },
  dayCard: {
    borderRadius: 12,
    padding: 10,
    backgroundColor: 'rgba(255, 183, 3, 0.15)',
    gap: 4,
  },
  daySummaryRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  daySummaryText: {
    color: '#0f4c5c',
    fontSize: 12,
    fontWeight: '700',
  },
  qaBlock: {
    gap: 2,
  },
  q: {
    color: '#0b2236',
    fontWeight: '700',
    fontSize: 13,
  },
  a: {
    color: '#225266',
    fontSize: 13,
  },
  inputWrap: {
    gap: 6,
  },
  label: {
    color: '#0b2236',
    fontWeight: '700',
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.35)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    color: '#0b2236',
    backgroundColor: '#fff',
    fontSize: 14,
  },
  inputMultiline: {
    minHeight: 96,
  },
  button: {
    marginTop: 4,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: '#fb8500',
  },
  buttonText: {
    color: '#1f2937',
    fontWeight: '800',
  },
  badge: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '700',
    color: '#134860',
    backgroundColor: 'rgba(33,158,188,0.16)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(33,158,188,0.22)',
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#fff',
  },
  rank: {
    color: '#0f4c5c',
    fontWeight: '800',
    fontSize: 15,
    width: 30,
  },
  rankBody: {
    flex: 1,
    gap: 4,
  },
  progressHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  barTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(46,72,97,0.16)',
    overflow: 'hidden',
    marginTop: 6,
  },
  barFill: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#219ebc',
  },
  goalRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#36536b',
    backgroundColor: '#fff',
  },
  checkboxDone: {
    backgroundColor: '#219ebc',
    borderColor: '#219ebc',
  },
  progressBlock: {
    marginTop: 8,
  },
  taskSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(15,76,92,0.05)',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 4,
  },
  taskStat: { alignItems: 'center' },
  taskStatNum: { fontSize: 22, fontWeight: '800', color: '#0f4c5c' },
  taskStatLabel: { fontSize: 11, color: '#4f7187', fontWeight: '600', marginTop: 2 },
  taskFilterRow: { flexDirection: 'row', gap: 8, marginVertical: 4 },
  taskFilterPill: {
    borderWidth: 1, borderColor: 'rgba(46,72,97,0.25)', borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#fff',
  },
  taskFilterPillActive: { backgroundColor: '#0f4c5c', borderColor: '#0f4c5c' },
  taskFilterText: { fontSize: 12, fontWeight: '700', color: '#36536b' },
  taskFilterTextActive: { color: '#fff' },
  taskItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderWidth: 1, borderColor: 'rgba(46,72,97,0.14)', borderRadius: 12,
    padding: 12, backgroundColor: '#fafeff',
  },
  taskItemDone: { opacity: 0.6, backgroundColor: '#f4f9f4' },
  taskBody: { flex: 1, gap: 5 },
  taskTitle: { fontSize: 14, fontWeight: '700', color: '#0b2236' },
  taskTitleDone: { textDecorationLine: 'line-through', color: '#4f7187' },
  taskMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  taskBadge: {
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3,
  },
  taskBadgeText: { fontSize: 10, fontWeight: '700' },
  taskDue: { fontSize: 11, color: '#4f7187' },
  taskForm: {
    borderWidth: 1, borderColor: 'rgba(15,76,92,0.2)', borderRadius: 12,
    padding: 12, gap: 8, backgroundColor: 'rgba(15,76,92,0.03)',
  },
  taskFormLabel: { fontSize: 12, fontWeight: '700', color: '#36536b', marginBottom: 2 },
  taskPillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  taskPill: {
    borderWidth: 1, borderColor: 'rgba(46,72,97,0.28)', borderRadius: 999,
    paddingHorizontal: 11, paddingVertical: 5, backgroundColor: '#fff',
  },
  taskPillText: { fontSize: 12, fontWeight: '600', color: '#36536b' },
  taskFormBtns: { flexDirection: 'row', marginTop: 4 },
  taskCancelBtn: {
    borderWidth: 1, borderColor: 'rgba(46,72,97,0.28)', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center', backgroundColor: '#fff',
  },
  taskCancelBtnText: { fontSize: 14, fontWeight: '700', color: '#36536b' },
  addItemBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(15,76,92,0.28)', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(15,76,92,0.05)',
    marginTop: 4,
  },
  addItemBtnText: { fontSize: 13, fontWeight: '700', color: '#0f4c5c' },
  noteItem: {
    borderWidth: 1, borderColor: 'rgba(46,72,97,0.14)', borderRadius: 12,
    backgroundColor: '#fafeff', overflow: 'hidden',
  },
  noteHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
  },
  noteTitle: { fontSize: 14, fontWeight: '700', color: '#0b2236' },
  noteDate: { fontSize: 11, color: '#4f7187', marginTop: 2 },
  noteBody: {
    borderTopWidth: 1, borderTopColor: 'rgba(46,72,97,0.1)',
    padding: 12, backgroundColor: '#f7fbfd',
  },
  noteContent: { fontSize: 14, color: '#36536b', lineHeight: 20 },
  bottomNav: {
    position: 'absolute',
    left: 12,
    right: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(28,77,107,0.2)',
    shadowColor: '#0f2940',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 6,
  },
  navButton: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 7,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    backgroundColor: 'transparent',
  },
  navButtonActive: {
    backgroundColor: 'rgba(142,202,230,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(20,91,128,0.25)',
  },
  navIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    color: '#48687d',
    fontSize: 10.5,
    fontWeight: '700',
  },
  navTextActive: {
    color: '#0b2236',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fb8500',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
    shadowColor: '#0f2940',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    zIndex: 100,
  },
  homePostFormCard: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(251,133,0,0.4)',
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  homeFormModeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  homeFormModePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.28)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#fff',
  },
  homeFormModePillActive: {
    backgroundColor: '#0f4c5c',
    borderColor: '#0f4c5c',
  },
  homeFormModeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#36536b',
  },
  homeFormModeTextActive: {
    color: '#fff',
  },
  homePostFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  homePostCategoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  homePostCategoryPill: {
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.28)',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  homePostCategoryPillActive: {
    backgroundColor: '#0f4c5c',
    borderColor: '#0f4c5c',
  },
  homePostCategoryText: {
    color: '#36536b',
    fontSize: 12,
    fontWeight: '700',
  },
  homePostCategoryTextActive: {
    color: '#fff',
  },
  homePostCard: {
    borderWidth: 1,
    borderColor: 'rgba(33,158,188,0.22)',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  postThumbnail: {
    width: '100%',
    height: 180,
  },
  homePostCardBody: {
    padding: 10,
    gap: 5,
  },
  postDeleteBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(230,57,70,0.08)',
  },
  homeSectionPost: {
    borderWidth: 1,
    borderColor: 'rgba(20,92,132,0.14)',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fefefe',
  },
  homeSectionPostImage: {
    width: '100%',
    height: 160,
  },
  homeSectionPostBody: {
    padding: 10,
    gap: 5,
  },
  postImagePreviewWrap: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  postImagePreview: {
    width: '100%',
    height: 160,
  },
  postImageRemoveBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 999,
  },
  postImagePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(15,76,92,0.35)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: 'rgba(15,76,92,0.06)',
  },
  postImagePickerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f4c5c',
  },
  practiceRecordBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  practiceRecordBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.28)',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  practiceRecordBtnActive: {
    backgroundColor: '#0f4c5c',
    borderColor: '#0f4c5c',
  },
  practiceRecordBtnText: {
    color: '#36536b',
    fontSize: 12,
    fontWeight: '700',
  },
  practiceRecordBtnTextActive: {
    color: '#fff',
  },
  practiceExpandBox: {
    marginTop: 6,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(142,202,230,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(33,158,188,0.25)',
    gap: 4,
  },
  practiceExpandLabel: {
    color: '#0f4c5c',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  practiceAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 11,
    backgroundColor: '#0f4c5c',
  },
  practiceAddBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  practiceFormCard: {
    borderWidth: 1,
    borderColor: 'rgba(20,92,132,0.2)',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    backgroundColor: '#fafeff',
  },
  practiceFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symbolToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(15,76,92,0.3)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(142,202,230,0.15)',
  },
  symbolToggleText: {
    color: '#0f4c5c',
    fontSize: 12,
    fontWeight: '700',
  },
  symbolPickerWrap: {
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.15)',
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#fff',
    gap: 8,
  },
  symbolCategoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  symbolCategoryPill: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.28)',
    borderRadius: 999,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  symbolCategoryPillActive: {
    backgroundColor: '#0f4c5c',
    borderColor: '#0f4c5c',
  },
  symbolCategoryText: {
    color: '#36536b',
    fontSize: 12,
    fontWeight: '700',
  },
  symbolCategoryTextActive: {
    color: '#fff',
  },
  symbolHint: {
    color: '#4f7187',
    fontSize: 11,
  },
  symbolHintField: {
    color: '#0f4c5c',
    fontWeight: '700',
  },
  symbolGridInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  symbolBtn: {
    borderWidth: 1,
    borderColor: 'rgba(33,158,188,0.3)',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'rgba(142,202,230,0.12)',
    minWidth: 36,
    alignItems: 'center',
  },
  symbolBtnText: {
    color: '#0b2236',
    fontSize: 14,
    fontWeight: '600',
  },
  resourcesIntroCard: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.16)',
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  resourcesIntroTitle: {
    color: '#0b2236',
    fontSize: 18,
    fontWeight: '800',
  },
  resourceSubjectCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.14)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  resourceSubjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderLeftWidth: 4,
  },
  resourceSubjectHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resourceSubjectIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceSubjectName: {
    fontSize: 16,
    fontWeight: '800',
  },
  resourceSubjectCount: {
    color: '#4f7187',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  resourceSubjectBody: {
    padding: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(46,72,97,0.1)',
  },
  resourceItem: {
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.14)',
    borderRadius: 12,
    padding: 12,
    gap: 5,
    backgroundColor: '#fafeff',
  },
  resourceItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resourceItemVideo: {
    padding: 0,
    overflow: 'hidden',
  },
  resourceVideoBody: {
    padding: 12,
    gap: 5,
  },
  resourceThumbWrap: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  resourceThumb: {
    width: '100%',
    height: 180,
    borderRadius: 0,
  },
  resourcePlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  resourceTypeBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceTypeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  resourceOpenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 4,
    backgroundColor: 'transparent',
  },
  resourceOpenBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  resourceAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    paddingVertical: 10,
  },
  resourceAddBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  resourceFormCard: {
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.16)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    backgroundColor: '#fff',
  },
  resourceFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  resourceTypeSection: {
    gap: 6,
  },
  resourceTypeScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  resourceTypePill: {
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.28)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  resourceTypePillText: {
    color: '#36536b',
    fontSize: 12,
    fontWeight: '700',
  },
  addPageSafe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  addPageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46,72,97,0.12)',
  },
  addPageBack: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(46,72,97,0.07)',
  },
  addPageTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0b2236',
  },
  addPageModeRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46,72,97,0.08)',
  },
  addPageModePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.28)',
    borderRadius: 999,
    paddingVertical: 9,
    backgroundColor: '#fff',
  },
  addPageModePillActive: {
    backgroundColor: '#0f4c5c',
    borderColor: '#0f4c5c',
  },
  addPageModeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#36536b',
  },
  addPageModeTextActive: {
    color: '#fff',
  },
  addPageScroll: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  addPageCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.12)',
  },
  addPageSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#36536b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addPageSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f4c5c',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  addPageSubmitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  lbModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lbModalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    width: '100%',
    maxHeight: 560,
  },
  lbModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  lbPickerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#36536b',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lbPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  lbPickerPill: {
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.3)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#f0f4f8',
  },
  lbPickerPillActive: {
    backgroundColor: '#2e4861',
    borderColor: '#2e4861',
  },
  lbPickerPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2e4861',
  },
  lbCatRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  lbCatPill: {
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.3)',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 7,
    backgroundColor: '#f0f4f8',
  },
  lbCatPillActive: {
    backgroundColor: '#2e4861',
    borderColor: '#2e4861',
  },
  lbCatText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2e4861',
  },
  lbModalBtns: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
})
