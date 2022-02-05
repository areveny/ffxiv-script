import './about.css';

function About() {
  return (
    <div className='about'>
      <h2>About</h2>
      <p>This is an unofficial resource to make the script of Final Fantasy XIV searchable. There are great gameplay resources such as <a href="https://garlandtools.org/">Garland Tools</a>, but these are not focused on the story text. 
      This site fills that role as a lore reference.</p>

      <p>This would not be possible without the efforts of FFXIV dataminers at <a href="https://github.com/xivapi/ffxiv-datamining">ffxiv-datamining</a> and <a href="https://github.com/xivapi/SaintCoinach">Saint Coinach</a>.</p>

      <p>This site is made by <a href="https://areveny.com">Areveny</a>. For feedback and requests, you can use email at <a href='mailto:self@areveny.com'>self@areveny.com</a> or Twitter at <a href='https://twitter.com/areveny/'>@areveny</a>.</p>

      <p>The source code is available on <a href='https://github.com/areveny/ffxiv-script'>my GitHub</a>.</p>

    </div>

  )
}

export default About;