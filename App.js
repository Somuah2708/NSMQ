import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { isSupabaseConfigured, supabase } from './lib/supabase'

const navigationItems = [
  { id: 'home', label: 'Home' },
  { id: 'practice', label: 'Practice' },
  { id: 'entry', label: 'Entry Hub' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'profile', label: 'Profile' },
]

const upcomingTrials = [
  {
    title: 'Achimota Internal Trial Round 4',
    date: 'May 2, 2026',
    time: '3:30 PM',
    venue: 'Science Resource Center',
    focus: 'Physics and Current Affairs',
  },
  {
    title: 'Inter-House NSMQ Simulation',
    date: 'May 7, 2026',
    time: '4:00 PM',
    venue: 'Main Hall',
    focus: 'Biology and Mathematics',
  },
  {
    title: 'Rapid Buzzing Drill',
    date: 'May 10, 2026',
    time: '2:45 PM',
    venue: 'Library Annex',
    focus: 'Speed and confidence',
  },
]

const announcements = [
  'Team jerseys will be distributed after prep on Tuesday.',
  'All contestants must submit updated NSMQ reading logs by Friday.',
  'Mock quarter-final pairings will be posted 24 hours before the event.',
]

const fixtures = [
  {
    event: 'Greater Accra NSMQ Warm-Up',
    date: 'May 15, 2026',
    opponent: 'PRESEC and Mfantsipim',
    target: 'Round 1 sweep',
  },
  {
    event: 'Regional Friendly Contest',
    date: 'May 20, 2026',
    opponent: 'Wesley Girls and Adisadel',
    target: 'Question-bank testing',
  },
]

const practiceDays = [
  {
    id: 'day1',
    label: 'Day One',
    date: 'Monday, April 27, 2026',
    agenda: 'Core science recall and buzzing rhythm.',
    subjects: [
      {
        name: 'Physics',
        questions: [
          {
            q: 'What is the SI unit of electric capacitance?',
            a: 'Farad (F).',
          },
          {
            q: 'State one difference between speed and velocity.',
            a: 'Speed has magnitude only; velocity has magnitude and direction.',
          },
        ],
      },
      {
        name: 'Chemistry',
        questions: [
          {
            q: 'Define an amphoteric oxide with one example.',
            a: 'An oxide that reacts with both acids and bases, for example Al2O3.',
          },
          {
            q: 'What is the role of a catalyst in a reaction?',
            a: 'It lowers activation energy and increases reaction rate without being consumed.',
          },
        ],
      },
    ],
  },
  {
    id: 'day2',
    label: 'Day Two',
    date: 'Wednesday, April 29, 2026',
    agenda: 'Math endurance and biology concept precision.',
    subjects: [
      {
        name: 'Mathematics',
        questions: [
          {
            q: 'Differentiate x^3 + 5x.',
            a: '3x^2 + 5.',
          },
          {
            q: 'If sin(theta) = 3/5 and theta is acute, what is cos(theta)?',
            a: '4/5.',
          },
        ],
      },
      {
        name: 'Biology',
        questions: [
          {
            q: 'Where does the light-dependent stage of photosynthesis occur?',
            a: 'In the thylakoid membranes of chloroplasts.',
          },
          {
            q: 'What is the basic functional unit of the kidney?',
            a: 'The nephron.',
          },
        ],
      },
    ],
  },
  {
    id: 'day3',
    label: 'Day Three',
    date: 'Friday, May 1, 2026',
    agenda: 'Current affairs and mixed rapid-fire rounds.',
    subjects: [
      {
        name: 'General Knowledge',
        questions: [
          {
            q: 'What does ECOWAS stand for?',
            a: 'Economic Community of West African States.',
          },
          {
            q: 'Name the capital city of Ghana.',
            a: 'Accra.',
          },
        ],
      },
      {
        name: 'Integrated Science',
        questions: [
          {
            q: 'What type of bond occurs in NaCl?',
            a: 'Ionic bond.',
          },
          {
            q: 'Why are enzymes described as specific?',
            a: 'Each enzyme acts on particular substrates due to its active site shape.',
          },
        ],
      },
    ],
  },
]

const fallbackLeaderboardData = [
  {
    student: 'Nana Kofi Asare',
    overall: 92,
    Physics: 95,
    Chemistry: 90,
    Biology: 88,
    Mathematics: 94,
    GK: 93,
  },
  {
    student: 'Ama Serwaa Boateng',
    overall: 89,
    Physics: 86,
    Chemistry: 92,
    Biology: 91,
    Mathematics: 87,
    GK: 90,
  },
  {
    student: 'Kwame Owusu Mensah',
    overall: 87,
    Physics: 89,
    Chemistry: 85,
    Biology: 84,
    Mathematics: 92,
    GK: 86,
  },
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
  'Post one useful resource in Entry Hub',
]

const subjects = ['overall', 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'GK']

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
})

const getUserDisplayName = (user) => {
  if (!user) return ''
  if (user.user_metadata?.full_name) return user.user_metadata.full_name
  if (user.email) return user.email.split('@')[0]
  return 'NSMQ Student'
}

export default function App() {
  const [activePage, setActivePage] = useState('home')
  const [selectedDay, setSelectedDay] = useState(practiceDays[0].id)
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
  const [entryForm, setEntryForm] = useState({
    title: '',
    type: 'Question',
    subject: 'General',
    details: '',
    author: '',
  })

  const currentDay =
    practiceDays.find((practiceDay) => practiceDay.id === selectedDay) ||
    practiceDays[0]

  const sortedLeaderboard = useMemo(() => {
    const metric = selectedSubject === 'overall' ? 'overall' : selectedSubject
    return [...leaderboardRows]
      .sort((a, b) => b[metric] - a[metric])
      .map((student, index) => ({ ...student, position: index + 1 }))
  }, [leaderboardRows, selectedSubject])

  const completedGoals = goalChecks.filter((item) => item.done).length
  const goalProgress = Math.round((completedGoals / goalChecks.length) * 100)

  const onChangeForm = (field, value) => {
    setEntryForm((prev) => ({ ...prev, [field]: value }))
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
        .select('student,overall,physics,chemistry,biology,mathematics,gk')
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

    loadSupabaseEntries()
    loadSupabaseLeaderboard()

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

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

  const toggleGoal = (index) => {
    setGoalChecks((prev) =>
      prev.map((item, i) => (i === index ? { ...item, done: !item.done } : item)),
    )
  }

  const pageHeading = {
    home: 'Upcoming Trials, News and Fixtures',
    practice: 'Practice Tabs, Dates and Question Banks',
    entry: 'Shared Entry Space for Questions and Documents',
    leaderboard: 'Ranking by Subject and Total Performance',
    profile: 'Progress Tracking and Growth Overview',
  }

  const nextFixture = fixtures[0]
  const quickStats = [
    { label: 'Trials This Week', value: upcomingTrials.length },
    { label: 'Announcements', value: announcements.length },
    { label: 'Upcoming Fixtures', value: fixtures.length },
  ]

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />
      <ScrollView contentContainerStyle={styles.container}>
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
                <Text style={styles.fixtureSpotlightTitle}>{nextFixture.event}</Text>
                <Text style={styles.fixtureSpotlightMeta}>{nextFixture.date}</Text>
                <Text style={styles.fixtureSpotlightMeta}>Opponents: {nextFixture.opponent}</Text>
              </View>
            </View>

            <View style={styles.homeSectionCard}>
              <Text style={styles.homeSectionTitle}>Upcoming NSMQ Trials</Text>
              {upcomingTrials.map((trial) => (
                <View key={trial.title} style={styles.homeItemCard}>
                  <View style={styles.homeItemTopRow}>
                    <Text style={styles.h3}>{trial.title}</Text>
                    <Text style={styles.homePill}>{trial.date}</Text>
                  </View>
                  <Text style={styles.text}>{trial.time} | {trial.venue}</Text>
                  <Text style={styles.focus}>Focus: {trial.focus}</Text>
                </View>
              ))}
            </View>

            <View style={styles.homeSectionCard}>
              <Text style={styles.homeSectionTitle}>Announcements</Text>
              {announcements.map((item) => (
                <View key={item} style={styles.announcementRow}>
                  <View style={styles.announcementDot} />
                  <Text style={styles.announcementText}>{item}</Text>
                </View>
              ))}
            </View>

            <View style={styles.homeSectionCard}>
              <Text style={styles.homeSectionTitle}>Events and Fixtures</Text>
              {fixtures.map((fixture) => (
                <View key={fixture.event} style={styles.homeItemCard}>
                  <View style={styles.homeItemTopRow}>
                    <Text style={styles.h3}>{fixture.event}</Text>
                    <Text style={styles.homePill}>{fixture.date}</Text>
                  </View>
                  <Text style={styles.text}>Against: {fixture.opponent}</Text>
                  <Text style={styles.focus}>Target: {fixture.target}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {activePage === 'practice' && (
          <Card title="Practice Planner">
            <View style={styles.practiceColumn}>
              {practiceDays.map((day) => {
                const questionCount = day.subjects.reduce(
                  (count, subject) => count + subject.questions.length,
                  0,
                )

                return (
                  <Pressable
                    key={day.id}
                    style={[styles.dayPill, selectedDay === day.id && styles.dayPillActive]}
                    onPress={() => setSelectedDay(day.id)}
                  >
                    <View style={styles.dayPillHeader}>
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
                        {day.subjects.length} subjects
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.dayPillMeta,
                        selectedDay === day.id && styles.dayPillMetaActive,
                      ]}
                    >
                      {day.date}
                    </Text>
                    <Text
                      style={[
                        styles.dayPillMeta,
                        selectedDay === day.id && styles.dayPillMetaActive,
                      ]}
                    >
                      {questionCount} question prompts
                    </Text>
                  </Pressable>
                )
              })}
            </View>

            <View style={styles.dayCard}>
              <Text style={styles.h3}>{currentDay.label}</Text>
              <Text style={styles.muted}>{currentDay.date}</Text>
              <Text style={styles.text}>{currentDay.agenda}</Text>
              <View style={styles.daySummaryRow}>
                <Text style={styles.daySummaryText}>Subjects: {currentDay.subjects.length}</Text>
                <Text style={styles.daySummaryText}>
                  Questions:{' '}
                  {currentDay.subjects.reduce(
                    (count, subject) => count + subject.questions.length,
                    0,
                  )}
                </Text>
              </View>
            </View>

            {currentDay.subjects.map((subject) => (
              <View key={subject.name} style={styles.itemCard}>
                <Text style={styles.h3}>{subject.name}</Text>
                {subject.questions.map((item) => (
                  <View key={item.q} style={styles.qaBlock}>
                    <Text style={styles.q}>Q: {item.q}</Text>
                    <Text style={styles.a}>A: {item.a}</Text>
                  </View>
                ))}
              </View>
            ))}
          </Card>
        )}

        {activePage === 'entry' && (
          <>
            <Card title="Submit NSMQ Material">
              <View style={styles.syncRow}>
                <Text style={styles.syncText}>{entryStatus}</Text>
                {isSyncingEntries ? (
                  <ActivityIndicator size="small" color="#0f4c5c" />
                ) : null}
              </View>
              <Input label="Title" value={entryForm.title} onChangeText={(v) => onChangeForm('title', v)} placeholder="Electrolysis revision set" />
              <Input label="Type" value={entryForm.type} onChangeText={(v) => onChangeForm('type', v)} placeholder="Question or Document" />
              <Input label="Subject" value={entryForm.subject} onChangeText={(v) => onChangeForm('subject', v)} placeholder="Physics, Chemistry, Math" />
              <Input label="Details" value={entryForm.details} onChangeText={(v) => onChangeForm('details', v)} placeholder="Paste notes or questions" multiline />
              <Input
                label="Your Name"
                value={isSupabaseConfigured ? getUserDisplayName(currentUser) || '' : entryForm.author}
                onChangeText={(v) => onChangeForm('author', v)}
                placeholder={isSupabaseConfigured ? 'Sign in on Profile tab' : 'Student or coach'}
                editable={!isSupabaseConfigured}
              />
              <Pressable style={styles.button} onPress={publishEntry}>
                <Text style={styles.buttonText}>Publish Entry</Text>
              </Pressable>
            </Card>

            <Card title="Community Feed">
              {entries.map((entry) => (
                <View key={entry.id} style={styles.itemCard}>
                  <Text style={styles.badge}>{entry.type}</Text>
                  <Text style={styles.h3}>{entry.title}</Text>
                  <Text style={styles.muted}>{entry.subject} | {entry.date}</Text>
                  <Text style={styles.text}>{entry.details}</Text>
                  <Text style={styles.focus}>By {entry.author}</Text>
                </View>
              ))}
            </Card>
          </>
        )}

        {activePage === 'leaderboard' && (
          <Card title="Student Leaderboard">
            <View style={styles.syncRow}>
              <Text style={styles.syncText}>{leaderboardStatus}</Text>
              {isSyncingLeaderboard ? (
                <ActivityIndicator size="small" color="#0f4c5c" />
              ) : null}
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

            {sortedLeaderboard.map((student) => (
              <View key={student.student} style={styles.scoreRow}>
                <Text style={styles.rank}>#{student.position}</Text>
                <View style={styles.rankBody}>
                  <Text style={styles.h3}>{student.student}</Text>
                  <Text style={styles.text}>
                    Overall {student.overall}% | Phy {student.Physics}% | Chem {student.Chemistry}% | Bio {student.Biology}% | Math {student.Mathematics}% | GK {student.GK}%
                  </Text>
                </View>
              </View>
            ))}
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
                      <Input
                        label="Full Name"
                        value={authForm.fullName}
                        onChangeText={(v) => handleAuthFieldChange('fullName', v)}
                        placeholder="e.g. Nana Kofi Asare"
                      />
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

            <Card title="Performance Tracker">
              <Text style={styles.muted}>Student: Achimota NSMQ Squad</Text>
              <View style={styles.progressHead}>
                <Text style={styles.text}>Weekly Goal Completion</Text>
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
              {[
                { subject: 'Physics', level: 82 },
                { subject: 'Chemistry', level: 78 },
                { subject: 'Biology', level: 74 },
                { subject: 'Mathematics', level: 85 },
                { subject: 'General Knowledge', level: 80 },
              ].map((item) => (
                <View key={item.subject} style={styles.progressBlock}>
                  <View style={styles.progressHead}>
                    <Text style={styles.text}>{item.subject}</Text>
                    <Text style={styles.text}>{item.level}%</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${item.level}%` }]} />
                  </View>
                </View>
              ))}
            </Card>
          </>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        {navigationItems.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.navButton, activePage === item.id && styles.navButtonActive]}
            onPress={() => setActivePage(item.id)}
          >
            <Text style={[styles.navText, activePage === item.id && styles.navTextActive]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
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
    paddingBottom: 110,
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
  },
  dayPill: {
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.28)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    gap: 3,
  },
  dayPillActive: {
    backgroundColor: '#0f4c5c',
    borderColor: '#0f4c5c',
  },
  dayPillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  dayPillTitle: {
    color: '#0b2236',
    fontWeight: '800',
    fontSize: 14,
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
  bottomNav: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(46,72,97,0.22)',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 8,
    gap: 8,
  },
  navButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 11,
    backgroundColor: 'transparent',
  },
  navButtonActive: {
    backgroundColor: '#8ecae6',
  },
  navText: {
    color: '#36536b',
    fontSize: 12,
    fontWeight: '700',
  },
  navTextActive: {
    color: '#0b2236',
  },
})
