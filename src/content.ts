/** Edit this file to personalize Sanjai's birthday experience. */

/** Public assets must respect Vite base (GitHub Pages lives under /sanjaibirthdaywishes/) */
const asset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

export const photoFrames = [
  {
    src: asset('photos/1.jpg'),
    caption: 'That day still makes me smile.',
    fallback: 'Memory 01',
  },
  {
    src: asset('photos/2.jpg'),
    caption: 'A frame I keep coming back to.',
    fallback: 'Memory 02',
  },
  {
    src: asset('photos/3.jpg'),
    caption: 'Soft light, quieter joy.',
    fallback: 'Memory 03',
  },
  {
    src: asset('photos/4.jpg'),
    caption: 'Proof that ordinary moments can feel special.',
    fallback: 'Memory 04',
  },
  {
    src: asset('photos/5.jpg'),
    caption: 'A little piece of our timeline.',
    fallback: 'Memory 05',
  },
  {
    src: asset('photos/6.jpg'),
    caption: 'For the days that felt easy with you around.',
    fallback: 'Memory 06',
  },
];

export const writtenMemories = [
  {
    title: 'The first laugh',
    text: 'The first memory I have with you is from June 13, when we had our very first long conversation. I remember feeling a little awkward at first, but shikha made the conversation fun by roasting u the whole time. It made me laugh more than I expected. You looked so innocent that day, and I really liked that about you. That simple conversation became a memory I will always cherish because it was the beginning',
  },
  {
    title: 'Small talks',
    text: 'Even the tiniest conversations somehow stayed with me longer than they should have.',
  },
  {
    title: 'Quiet presence',
    text: 'Some people fill silence. You make silence feel comfortable.',
  },
  { 
    title: 'Everyday magic',
    text: 'Just a week after we met, we were spending time together every single day. It felt almost magical. Somehow, even the most ordinary moments became special whenever I was with you. Thank you for standing by my side during one of the hardest times in my life. Your presence brought me comfort, laughter, and strength when I needed it the most. I wil always be grateful for those moments we shared—they mean more to me than words can express💫✨',
  },
];

export const balloonWishes = [
  {
    id: 1,
    emoji: '🤍',
    label: 'Soft start',
    wish: 'May every morning feel gentle, and every night feel safe.',
    tint: '#ffc078',
  },
  {
    id: 2,
    emoji: '🌸',
    label: 'Bloom',
    wish: 'May this year bloom in quiet, beautiful ways around you.',
    tint: '#ff9a3c',
  },
  {
    id: 3,
    emoji: '✨',
    label: 'Sparkle',
    wish: 'Keep that rare sparkle — even on the plainest days.',
    tint: '#e8721a',
  },
  {
    id: 4,
    emoji: '🌙',
    label: 'Calm',
    wish: 'May your mind find soft landings whenever it needs rest.',
    tint: '#ffb347',
  },
  {
    id: 5,
    emoji: '🥂',
    label: 'Cheers',
    wish: 'To Sanjai — more laughter, softer days, and wishes that come true.',
    tint: '#ffa05a',
  },
];

export const reasonCards = [
  { emoji: '😊', title: 'Your innocent face', text: 'Looks so cute..but are not innocent at all.' },
  { emoji: '🎧', title: 'Your vibe', text: 'Calm, bright and always comforting.Thats what i love about you.' },
  { emoji: '🌿', title: 'Your presence', text: 'My cheeks will start hurting cz, i will be keep smiling when i am with you :)' },
  { emoji: '☀️', title: 'Your energy', text: 'Soft enough to soothe, strong enough to inspire.' },
];

export const constellationNotes = [
  'You are someone rare.',
  'Your kindness leaves a mark.',
  'The world feels softer near you.',
  'You deserve gentle days.',
  'Your smile is a whole season.',
  'The world needs more hearts like yours.',
  'Your presence makes people feel safe.',
  'Stay soft. Stay glowing.',
];

export const letterLines = [
  'Hey Sanjai,',
  'If I could wrap a feeling into a birthday wish,',
  'it would be this: may you always feel seen,',
  'may your days stay soft around the edges,',
  'and may every season bring you closer to the life you dream about.',
  'It\'s funny how someone you\'ve known for only a short time can become such an important part of your days. Thank you for all the laughter, the support, and the memories we\'ve made together. I hope life gives you the same kindness that you give to others. Happy Birthday!🎉',
  '— someone who thinks of you more often than you know',
];

export const bouquetImage = asset('photos/bouquet.jpg');

export const bouquetMessage =''
export const bouquetMeaning = [
  { emoji: '🌹', text: '6 red roses — sincere admiration' },
  { emoji: '🌻', text: '2 sunflowers — warmth & brighter days' },
];

export const cakeName = 'sleepy guy';

export const cakeWishes = [
  'sweet dreams & soft days',
  'Happy Birthday',
  'may your year feel gentle',
];
