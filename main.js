// WARNING.... THIS CODE WAS THROWN TOGETHER VERYY QUICK TO ACCOUNT TO WEIRD ISSUES POPPING UP
// IN THE CHART IN REAL TIME WHILE HUNDREDS OF PEOPLE FILL IT OUT AND COMPLAIN ON TWITTER
// IT SUCKS VERY BAD AND IS HORRIBLE I WILL FIX IT FOR THE 2025 VERSION !!!!!


const CONFIG = {
  FORM_ID: '',
  SHEET_NAME: 'Form Responses 1',
  MATCHUP_CHART_RANGE: 'Matchup Chart!B2:AA27',
  HEADER_ROW_RANGE: 'Matchup Chart!B1:AA1',
  FIRST_COLUMN_RANGE: 'Matchup Chart!A2:A27',
  GRID_SIZE: 26,
  ROUNDING_FACTOR: 5
};

// Name: str -> num: int
const CHARACTER_MAP = {
  'Fox': 1,
  'Falco': 2,
  'Sheik': 3,
  'Marth': 4,
  'Jigglypuff': 5,
  'Peach': 6,
  'Captain Falcon': 7,
  'Ice Climbers': 8,
  'Samus': 9,
  'Pikachu': 10,
  'Dr. Mario': 11,
  'Ganondorf': 12,
  'Luigi': 13,
  'Yoshi': 14,
  'Young Link': 15,
  'Mario': 16,
  'Link': 17,
  'Donkey Kong': 18,
  'Mr. Game and Watch': 19,
  'Roy': 20,
  'Mewtwo': 21,
  'Ness': 22,
  'Zelda': 23,
  'Pichu': 24,
  'Kirby': 25,
  'Bowser': 26
};

// Character icon URLs from the ssb wiki (they are square thank god)
const CHARACTER_ICONS = {
  0: 'https://ssb.wiki.gallery/images/d/db/FoxHeadSSBM.png',
  1: 'https://ssb.wiki.gallery/images/d/d6/FalcoHeadSSBM.png',
  2: 'https://ssb.wiki.gallery/images/7/76/SheikHeadSSBM.png',
  3: 'https://ssb.wiki.gallery/images/9/9b/MarthHeadSSBM.png',
  4: 'https://ssb.wiki.gallery/images/5/5a/JigglypuffHeadSSBM.png',
  5: 'https://ssb.wiki.gallery/images/3/3f/PeachHeadSSBM.png',
  6: 'https://ssb.wiki.gallery/images/5/5f/CaptainFalconHeadSSBM.png',
  7: 'https://ssb.wiki.gallery/images/d/d1/IceClimbersHeadSSBM.png',
  8: 'https://ssb.wiki.gallery/images/f/f6/SamusHeadSSBM.png',
  9: 'https://ssb.wiki.gallery/images/8/88/PikachuHeadSSBM.png',
  10: 'https://ssb.wiki.gallery/images/6/61/DrMarioHeadSSBM.png',
  11: 'https://ssb.wiki.gallery/images/7/77/GanondorfHeadSSBM.png',
  12: 'https://ssb.wiki.gallery/images/d/d1/LuigiHeadSSBM.png',
  13: 'https://ssb.wiki.gallery/images/6/6d/YoshiHeadSSBM.png',
  14: 'https://ssb.wiki.gallery/images/a/ac/YoungLinkHeadSSBM.png',
  15: 'https://ssb.wiki.gallery/images/e/ec/MarioHeadSSBM.png',
  16: 'https://ssb.wiki.gallery/images/1/17/LinkHeadSSBM.png',
  17: 'https://ssb.wiki.gallery/images/9/9b/DonkeyKongHeadSSBM.png',
  18: 'https://ssb.wiki.gallery/images/b/ba/MrGame%26WatchHeadSSBM.png',
  19: 'https://ssb.wiki.gallery/images/f/f2/RoyHeadSSBM.png',
  20: 'https://ssb.wiki.gallery/images/5/5b/MewtwoHeadSSBM.png',
  21: 'https://ssb.wiki.gallery/images/4/47/NessHeadSSBM.png',
  22: 'https://ssb.wiki.gallery/images/2/29/ZeldaHeadSSBM.png',
  23: 'https://ssb.wiki.gallery/images/3/30/PichuHeadSSBM.png',
  24: 'https://ssb.wiki.gallery/images/7/7a/KirbyHeadSSBM.png',
  25: 'https://ssb.wiki.gallery/images/3/3b/BowserHeadSSBM.png'
};

/**
 * Main function to fetch and proccess form responses
 */
function fetchResponses() {
  try {
    const form = FormApp.openById(CONFIG.FORM_ID);
    const sheet = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEET_NAME);
    const sheetData = sheet.getDataRange().getValues();
    
    const matchupData = Array(CONFIG.GRID_SIZE).fill().map(() => []);
    
    for (let i = 1; i < sheetData.length; i++) {
      console.log(`Processing response ${i}/${sheetData.length - 1}`);
      const responseData = processResponse(sheetData[i], sheetData[0]);
      const characterIndex = getCharacterNumber(sheetData[i][1]) - 1;
      
      if (characterIndex >= 0) {
        matchupData[characterIndex].push(responseData);
      }
    }
    
    const finalData = generateMatchupChart(matchupData);
    displayResults(finalData);
  } catch (error) {
    console.error('ERROR in fetchResponses:', error)
  }
}

/**
 * process individual response data
 */
function processResponse(responseRow, headerRow) {
  const responseData = Array(CONFIG.GRID_SIZE).fill(-1);
  
  for (let j = 2; j < responseRow.length; j++) {
    const matchupCharacter = headerRow[j].split(' vs ')[1].split('?')[0];
    const vsCharNum = getCharacterNumber(matchupCharacter);
    if (vsCharNum > 0) {
      responseData[vsCharNum - 1] = parseInt(responseRow[j].split(':')[0]);
    }
  }
  
  return responseData;
}

/**
 * Calculate matchup statistics between two characters
 */
function calculateMatchup(char1Data, char1Num, char2Data, char2Num) {
  const matchupScores = [];
  
  // collect direct matchup scores
  char1Data.forEach(data => {
    if (data[char2Num - 1] >= 0) {
      matchupScores.push(data[char2Num - 1]);
    }
  });
  
  // collect inverse matchup score
  char2Data.forEach(data => {
    if (data[char1Num - 1] >= 0) {
      matchupScores.push(100 - data[char1Num - 1]);
    }
  });
  return matchupScores.length > 0 ? calculateMedian(matchupScores) : -1;
}

/**
 * Calculate median value with rounding
 */
function calculateMedian(values) {
  const sortedValues = [...values].sort((a, b) => a - b);
  const midPoint = Math.floor(sortedValues.length / 2);
  
  if (sortedValues.length > 1 && sortedValues.length % 2 === 0) {
    if (sortedValues[midPoint] !== sortedValues[midPoint - 1]) {
      return Math.floor(((sortedValues[midPoint] + sortedValues[midPoint - 1]) / 2) / CONFIG.ROUNDING_FACTOR) * CONFIG.ROUNDING_FACTOR;
    }
  }
  
  return sortedValues[midPoint];
}

/**
 * Weird stuff to weight matchups based on the character rank
 */
function calculateTiers(matchupChart) {
  const scores = Array(CONFIG.GRID_SIZE).fill(0);
  
  for (let i = 0; i < CONFIG.GRID_SIZE; i++) {
    for (let j = 0; j < CONFIG.GRID_SIZE; j++) {
      if (matchupChart[i][j]) {
        const winRate = parseInt(matchupChart[i][j].split('-')[0]);
        const weight = (CONFIG.GRID_SIZE - j) / 2;

        // theres gotta be a better way to do this
        if (winRate <= 60) scores[i] -= weight;
        if (winRate < 50) scores[i] -= weight * 2;
        if (winRate >= 50) scores[i] += weight;
        if (winRate >= 55) scores[i] += weight / 1.5;
        if (winRate >= 60) scores[i] += weight / 2;
        if (winRate >= 70) scores[i] += weight / 2;
      }
    }
  }
  return scores;
}

/**
 * Display results in the spreadsheet
 */
function displayResults(finalData) {
  const sheet = SpreadsheetApp.getActive();
  const { matchupChart, headerIcons, rowIcons } = finalData;
  
  sheet.getRange(CONFIG.MATCHUP_CHART_RANGE).setValues(matchupChart).setHorizontalAlignment('center').setVerticalAlignment('middle').setFontSize(9).setFontWeight('bold');
       
  sheet.getRange(CONFIG.HEADER_ROW_RANGE).setValues(headerIcons).setHorizontalAlignment('center').setVerticalAlignment('middle');
       
  sheet.getRange(CONFIG.FIRST_COLUMN_RANGE).setValues(rowIcons).setHorizontalAlignment('center').setVerticalAlignment('middle');
}

function getCharacterNumber(characterName) {
  return CHARACTER_MAP[characterName] || -1;
}

function getCharacterIcon(index) {
  return CHARACTER_ICONS[index] || '';
}

function createMultiDimensionalArray(dimensions) {
  if (dimensions.length === 0) return undefined;
  
  const [currentDim, ...remainingDims] = dimensions;
  return Array(currentDim).fill().map(() => createMultiDimensionalArray(remainingDims));
}
