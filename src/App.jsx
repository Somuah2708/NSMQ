import { useMemo, useState } from 'react'
import './App.css'

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
          {
            q: 'Why is terminal velocity reached during free fall with air resistance?',
            a: 'Because drag force grows until it balances weight, making net force zero.',
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
            q: 'What is the pH of a neutral solution at 25 deg C?',
            a: 'pH 7.',
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
            q: 'Find the sum of the first 20 terms of 2, 5, 8, ...',
            a: '610.',
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
          {
            q: 'State one function of red blood cells.',
            a: 'Transport oxygen using hemoglobin.',
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
          {
            q: 'Which instrument measures atmospheric pressure?',
            a: 'Barometer.',
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
            q: 'State Newtons first law in simple terms.',
            a: 'A body remains at rest or in uniform motion unless acted on by a net external force.',
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

const leaderboardData = [
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
  {
    student: 'Abena Nyarko',
    overall: 84,
    Physics: 82,
    Chemistry: 88,
    Biology: 85,
    Mathematics: 83,
    GK: 84,
  },
]

const initialEntries = [
  {
    id: 1,
    title: 'Organic Chemistry Summary Deck',
    type: 'Document',
    subject: 'Chemistry',
    details: 'A compact revision deck for hydrocarbons and reaction pathways.',
    link: 'https://example.com/organic-revision',
    author: 'Coach Mensima',
    date: 'Apr 23, 2026',
  },
  {
    id: 2,
    title: 'Question: Projectile Motion Trap',
    type: 'Question',
    subject: 'Physics',
    details: 'How do we quickly select the right SUVAT equation under pressure?',
    link: '',
    author: 'Nana Kofi Asare',
    date: 'Apr 24, 2026',
  },
]

const weeklyGoals = [
  'Attempt 50 rapid-fire questions',
  'Revise at least 2 weak science topics',
  'Complete one timed mock each weekend',
  'Post one useful resource in Entry Hub',
]

function App() {
  const [activePage, setActivePage] = useState('home')
  const [selectedDay, setSelectedDay] = useState(practiceDays[0].id)
  const [entries, setEntries] = useState(initialEntries)
  const [selectedSubject, setSelectedSubject] = useState('overall')
  const [goalChecks, setGoalChecks] = useState(
    weeklyGoals.map((goal) => ({ goal, done: false })),
  )
  const [entryForm, setEntryForm] = useState({
    title: '',
    type: 'Question',
    subject: 'General',
    details: '',
    link: '',
    author: '',
  })

  const currentDay =
    practiceDays.find((practiceDay) => practiceDay.id === selectedDay) ||
    practiceDays[0]

  const sortedLeaderboard = useMemo(() => {
    const metric = selectedSubject === 'overall' ? 'overall' : selectedSubject
    return [...leaderboardData]
      .sort((a, b) => b[metric] - a[metric])
      .map((student, index) => ({ ...student, position: index + 1 }))
  }, [selectedSubject])

  const completedGoals = goalChecks.filter((item) => item.done).length
  const goalProgress = Math.round((completedGoals / goalChecks.length) * 100)

  const handleEntryChange = (event) => {
    const { name, value } = event.target
    setEntryForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleEntrySubmit = (event) => {
    event.preventDefault()
    if (!entryForm.title.trim() || !entryForm.details.trim() || !entryForm.author.trim()) {
      return
    }

    const newEntry = {
      id: Date.now(),
      title: entryForm.title.trim(),
      type: entryForm.type,
      subject: entryForm.subject,
      details: entryForm.details.trim(),
      link: entryForm.link.trim(),
      author: entryForm.author.trim(),
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    }

    setEntries((previous) => [newEntry, ...previous])
    setEntryForm({
      title: '',
      type: 'Question',
      subject: 'General',
      details: '',
      link: '',
      author: '',
    })
  }

  const toggleGoal = (index) => {
    setGoalChecks((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index ? { ...item, done: !item.done } : item,
      ),
    )
  }

  const renderHome = () => (
    <section className="page-grid">
      <article className="panel wide">
        <div className="panel-title-row">
          <h2>Upcoming NSMQ Trials</h2>
          <span className="badge">Prepared for victory</span>
        </div>
        <div className="stack-list">
          {upcomingTrials.map((trial) => (
            <div className="event-card" key={trial.title}>
              <h3>{trial.title}</h3>
              <p>
                {trial.date} at {trial.time}
              </p>
              <p>{trial.venue}</p>
              <p className="event-focus">Focus: {trial.focus}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="panel">
        <h2>Announcements</h2>
        <ul className="text-list">
          {announcements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>

      <article className="panel">
        <h2>Events and Fixtures</h2>
        <div className="stack-list">
          {fixtures.map((fixture) => (
            <div className="fixture-row" key={fixture.event}>
              <p className="fixture-name">{fixture.event}</p>
              <p>{fixture.date}</p>
              <p>Against: {fixture.opponent}</p>
              <p className="event-focus">Target: {fixture.target}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  )

  const renderPractice = () => (
    <section className="panel practice-panel">
      <div className="panel-title-row">
        <h2>Practice Planner</h2>
        <span className="badge">Structured daily sessions</span>
      </div>

      <div className="tabs" role="tablist" aria-label="Practice days">
        {practiceDays.map((day) => (
          <button
            key={day.id}
            type="button"
            role="tab"
            aria-selected={selectedDay === day.id}
            className={`tab-chip ${selectedDay === day.id ? 'active' : ''}`}
            onClick={() => setSelectedDay(day.id)}
          >
            {day.label}
          </button>
        ))}
      </div>

      <div className="practice-day-card">
        <h3>{currentDay.label}</h3>
        <p className="muted">{currentDay.date}</p>
        <p>{currentDay.agenda}</p>
      </div>

      <div className="subject-grid">
        {currentDay.subjects.map((subject) => (
          <article className="subject-card" key={subject.name}>
            <h3>{subject.name}</h3>
            <ul className="qa-list">
              {subject.questions.map((item) => (
                <li key={item.q}>
                  <p className="q">Q: {item.q}</p>
                  <p className="a">A: {item.a}</p>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )

  const renderEntry = () => (
    <section className="page-grid entry-layout">
      <article className="panel">
        <h2>Submit NSMQ Material</h2>
        <form className="entry-form" onSubmit={handleEntrySubmit}>
          <label>
            Title
            <input
              name="title"
              value={entryForm.title}
              onChange={handleEntryChange}
              placeholder="e.g. Electrolysis revision set"
            />
          </label>
          <label>
            Type
            <select name="type" value={entryForm.type} onChange={handleEntryChange}>
              <option>Question</option>
              <option>Document</option>
              <option>Announcement</option>
            </select>
          </label>
          <label>
            Subject
            <input
              name="subject"
              value={entryForm.subject}
              onChange={handleEntryChange}
              placeholder="Physics, Chemistry, Math..."
            />
          </label>
          <label>
            Details
            <textarea
              name="details"
              value={entryForm.details}
              onChange={handleEntryChange}
              rows="4"
              placeholder="Paste your question, summary, or notes here."
            />
          </label>
          <label>
            Document Link (optional)
            <input
              name="link"
              value={entryForm.link}
              onChange={handleEntryChange}
              placeholder="https://..."
            />
          </label>
          <label>
            Your Name
            <input
              name="author"
              value={entryForm.author}
              onChange={handleEntryChange}
              placeholder="Student or coach"
            />
          </label>
          <button type="submit" className="action-btn">
            Publish Entry
          </button>
        </form>
      </article>

      <article className="panel">
        <h2>Community Feed</h2>
        <div className="feed-list">
          {entries.map((entry) => (
            <article className="feed-card" key={entry.id}>
              <div className="feed-top-row">
                <span className="badge">{entry.type}</span>
                <span className="muted">{entry.date}</span>
              </div>
              <h3>{entry.title}</h3>
              <p className="muted">{entry.subject}</p>
              <p>{entry.details}</p>
              {entry.link ? (
                <a href={entry.link} target="_blank" rel="noreferrer">
                  Open document
                </a>
              ) : null}
              <p className="feed-author">By {entry.author}</p>
            </article>
          ))}
        </div>
      </article>
    </section>
  )

  const renderLeaderboard = () => (
    <section className="panel leaderboard-panel">
      <div className="panel-title-row">
        <h2>Student Leaderboard</h2>
        <div className="selector-wrap">
          <label htmlFor="subjectSelect">View by subject</label>
          <select
            id="subjectSelect"
            value={selectedSubject}
            onChange={(event) => setSelectedSubject(event.target.value)}
          >
            <option value="overall">Overall</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
            <option value="Mathematics">Mathematics</option>
            <option value="GK">General Knowledge</option>
          </select>
        </div>
      </div>

      <div className="podium-grid">
        {sortedLeaderboard.slice(0, 3).map((student) => (
          <article className="podium-card" key={student.student}>
            <p className="muted">Position #{student.position}</p>
            <h3>{student.student}</h3>
            <p className="score">
              {selectedSubject === 'overall'
                ? student.overall
                : student[selectedSubject]}
              %
            </p>
          </article>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Pos</th>
              <th>Student</th>
              <th>Overall</th>
              <th>Physics</th>
              <th>Chemistry</th>
              <th>Biology</th>
              <th>Mathematics</th>
              <th>GK</th>
            </tr>
          </thead>
          <tbody>
            {sortedLeaderboard.map((student) => (
              <tr key={student.student}>
                <td>{student.position}</td>
                <td>{student.student}</td>
                <td>{student.overall}</td>
                <td>{student.Physics}</td>
                <td>{student.Chemistry}</td>
                <td>{student.Biology}</td>
                <td>{student.Mathematics}</td>
                <td>{student.GK}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )

  const renderProfile = () => (
    <section className="page-grid profile-layout">
      <article className="panel">
        <h2>Performance Tracker</h2>
        <p className="muted">Student: Achimota NSMQ Squad</p>

        <div className="progress-block">
          <div className="progress-head">
            <p>Weekly Goal Completion</p>
            <p>{goalProgress}%</p>
          </div>
          <div className="bar-track" aria-hidden="true">
            <div className="bar-fill" style={{ width: `${goalProgress}%` }} />
          </div>
        </div>

        <ul className="checklist">
          {goalChecks.map((item, index) => (
            <li key={item.goal}>
              <label>
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleGoal(index)}
                />
                {item.goal}
              </label>
            </li>
          ))}
        </ul>
      </article>

      <article className="panel">
        <h2>Subject Progress Snapshot</h2>
        <div className="subject-progress-grid">
          {[
            { subject: 'Physics', level: 82 },
            { subject: 'Chemistry', level: 78 },
            { subject: 'Biology', level: 74 },
            { subject: 'Mathematics', level: 85 },
            { subject: 'General Knowledge', level: 80 },
          ].map((item) => (
            <div key={item.subject}>
              <div className="progress-head">
                <p>{item.subject}</p>
                <p>{item.level}%</p>
              </div>
              <div className="bar-track" aria-hidden="true">
                <div className="bar-fill" style={{ width: `${item.level}%` }} />
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  )

  const pageHeading = {
    home: 'Upcoming Trials, News and Fixtures',
    practice: 'Practice Tabs, Dates and Question Banks',
    entry: 'Shared Entry Space for Questions and Documents',
    leaderboard: 'Ranking by Subject and Total Performance',
    profile: 'Progress Tracking and Growth Overview',
  }

  const renderActivePage = () => {
    if (activePage === 'home') return renderHome()
    if (activePage === 'practice') return renderPractice()
    if (activePage === 'entry') return renderEntry()
    if (activePage === 'leaderboard') return renderLeaderboard()
    return renderProfile()
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="eyebrow">ACHIMOTA NSMQ APP</p>
        <h1>{pageHeading[activePage]}</h1>
        <p className="muted">A focused space for contestants, coaches, and academic support.</p>
      </header>

      <main className="page-area">{renderActivePage()}</main>

      <nav className="bottom-nav" aria-label="App navigation">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-button ${activePage === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default App
