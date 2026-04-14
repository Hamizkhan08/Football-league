import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Load env vars manually from .env file
const envContent = fs.readFileSync('.env', 'utf8')
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const [key, ...val] = line.split('=')
      return [key.trim(), val.join('=').trim()]
    })
)

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseKey = env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const teamsData = [
  {
    name: 'A3 Heroes',
    captain: 'Harsh',
    pool: 'A',
    players: ['Kabir Bagade', 'Vedant Jadhav', 'Ashish Koli', 'Aditya Kale', 'Yash Jadhav', 'Zayed Shaikh', 'Arth Gangurde', 'Prathmesh Sonar']
  },
  {
    name: 'Dynamic Destroyers',
    captain: 'Bhagwan',
    pool: 'A',
    players: ['Dev Soni', 'Sahil Pagare', 'Pavan Kadam', 'Prathmesh Diwate', 'Prem Barma', 'Himanshu Shirsat', 'Ajay Gujrati', 'Murtaza Ujjainwala']
  },
  {
    name: 'Urban Kickers',
    captain: 'Krish',
    pool: 'A',
    players: ['Shlok Aher', 'Darshan Pawar', 'Raj Bedmutha', 'Ali Abbas', 'Unmesh Bhamre', 'Om Borade', 'Krishna Desai', 'Rudra Patel']
  },
  {
    name: 'Viking Warriors',
    captain: 'Ashmak',
    pool: 'A',
    players: ['Harsh Gulve', 'Prathamesh Bhor', 'Rushikesh Wagh', 'Suyog Khandagale', 'Prarik Chikale', 'Ashish', 'Nidhish Shinde', 'Arya Chavan']
  },
  {
    name: 'Top Predators',
    captain: 'Ritesh',
    pool: 'A',
    players: ['Shubh Jachak', 'Addy Shelke', 'Salik Parhan', 'Atharva Godse', 'Pranav Bachav', 'Arya Agarkar', 'Shreerang Ganore', 'Ravin Sonar']
  },
  {
    name: 'Elite Warriors',
    captain: 'Dhruv',
    pool: 'B',
    players: ['Kanishk Shelke', 'Gaurav Jadhav', 'Bhavarth Dive', 'Dnyanesh Wagh', 'Prem Nikam', 'Himanshu Kumar', 'Priyesh Wankhede', 'Bharga Khambalwar']
  },
  {
    name: 'Ronak Dominators',
    captain: 'Sahil',
    pool: 'B',
    players: ['Hanzala Shah', 'Uday Deore', 'Soham Magar', 'Hyder Ali', 'Ethan Kolge', 'Sushil Kamble', 'Omkar Toge', 'Pranav Borade']
  },
  {
    name: 'NSA',
    captain: 'Gurman',
    pool: 'B',
    players: ['Raj Pande', 'Dev Thakur', 'Atharva Bagul', 'Kushal More', 'Krushna Bhosle', 'Bhavesh Gangurde', 'Soham Avhad', 'Swayam Jadhav']
  },
  {
    name: 'Culers FC',
    captain: 'Aditya',
    pool: 'B',
    players: ['Shivam Wagh', 'Aditya Todkar', 'Aditya Pawar', 'Archit Jadhav', 'Rushikesh Rathod', 'Vivek Salunke', 'Swapnil Patil', 'Yahya Shaikh']
  },
  {
    name: 'Ishan FC',
    captain: 'Khemraj',
    pool: 'B',
    players: ['Siddhant Ghangale', 'Pranav Rajput', 'Kalpesh Porje', 'Arjun Tupe', 'Ishan Nair', 'Aditya Sonawne', 'Vinay Thakkar', 'Urjit Khairnar']
  }
]

async function seed() {
  console.log('--- CLEANING DATABASE ---')
  await supabase.from('players').delete().neq('id', '0') // Delete all
  await supabase.from('matches').delete().neq('id', '0')
  await supabase.from('teams').delete().neq('id', '0')
  console.log('Tables cleared.')

  const teamMap = {} // name -> id

  console.log('--- INSERTING TEAMS ---')
  for (const t of teamsData) {
    const { data, error } = await supabase.from('teams').insert([{
      name: t.name,
      captain_name: t.captain,
      pool: t.pool
    }]).select()
    
    if (error) {
      console.error(`Error inserting team ${t.name}:`, error.message)
      continue
    }
    teamMap[t.name] = data[0].id
    
    // Insert players
    console.log(`Inserting players for ${t.name}...`)
    const playersToInsert = t.players.map(pName => ({
      team_id: data[0].id,
      name: pName,
      is_captain: pName.includes(t.captain), // Simple check
      position: 'Forward' // Default
    }))
    
    const { error: pError } = await supabase.from('players').insert(playersToInsert)
    if (pError) console.error(`Error inserting players for ${t.name}:`, pError.message)
  }

  console.log('--- GENERATING MATCHES ---')
  const pools = ['A', 'B']
  for (const pool of pools) {
    const poolTeams = Object.keys(teamMap).filter(name => teamsData.find(td => td.name === name).pool === pool)
    
    // Create Round Robin for the pool (simplified: each team plays 4 matches)
    for (let i = 0; i < poolTeams.length; i++) {
      for (let j = i + 1; j < poolTeams.length; j++) {
        const teamA = poolTeams[i]
        const teamB = poolTeams[j]
        
        const scoreA = Math.floor(Math.random() * 6)
        const scoreB = Math.floor(Math.random() * 6)
        
        const { error: mError } = await supabase.from('matches').insert([{
          team_a_id: teamMap[teamA],
          team_b_id: teamMap[teamB],
          score_a: scoreA,
          score_b: scoreB,
          status: 'completed',
          pool: pool,
          is_knockout: false,
          match_date: new Date().toISOString(),
          fouls_a: Math.floor(Math.random() * 5),
          fouls_b: Math.floor(Math.random() * 5)
        }])
        
        if (mError) console.error(`Error inserting match ${teamA} vs ${teamB}:`, mError.message)
      }
    }
  }

  console.log('--- SEEDING COMPLETE ---')
}

seed().catch(console.error)
