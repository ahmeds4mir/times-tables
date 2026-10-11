// Spoken hint shown and played when a chapter opens. `say` is the text sent to the
// voice generator (tools/make-voices.js) when it must differ from the on-screen text.
window.INTROS = {
  tables: {
    ar: { text: 'هيا نراجع جدول الضرب! نختار جدولاً، ونضغط على كل سطر لنرى الرسم، ثم نلعب ونجمع النجوم ⭐' },
    en: { text: "Let's review the times tables! Pick a table, tap each row to see the picture, then play and collect stars ⭐" },
  },
  chapter1: {
    ar: {
      text: 'قواعد الضرب: عندما نزيد مجموعة، يزيد الناتج بالعدد نفسه. وتبديل مكان العددين لا يغيّر الناتج: ٣ × ٤ = ٤ × ٣. هيا نهزم الوحوش! ⚔️',
      say: 'في الفصل الأول نتعلم قواعد الضرب. عندما نزيد مجموعة واحدة، يزيد الناتج بالعدد نفسه. وتبديل مكان العددين لا يغيّر الناتج: ثلاثة في أربعة، يساوي أربعة في ثلاثة. هيا نهزم الوحوش!',
    },
    en: {
      text: 'Rules of multiplication: one more group adds the same number again, and swapping the numbers keeps the answer: 3 × 4 = 4 × 3. Let’s beat the monsters! ⚔️',
      say: 'In chapter one we learn the rules of multiplication. One more group adds the same number again, and swapping the numbers keeps the answer the same: three times four equals four times three. Let’s beat the monsters!',
    },
  },
  chapter2: {
    ar: {
      text: 'الساعة: العقرب القصير يشير إلى الساعات، والعقرب الطويل يشير إلى الدقائق. كل رقم على الساعة = ٥ دقائق ⏰',
      say: 'في الفصل الثاني نتعلم قراءة الساعة. العقرب القصير يشير إلى الساعات، والعقرب الطويل يشير إلى الدقائق. وكل رقم على الساعة يساوي خمس دقائق.',
    },
    en: {
      text: 'The clock: the short hand shows the hours and the long hand shows the minutes. Each number on the clock = 5 minutes ⏰',
      say: 'In chapter two we learn to read the clock. The short hand shows the hours, and the long hand shows the minutes. Each number on the clock means five minutes.',
    },
  },
  ch3: {
    ar: {
      text: 'القسمة توزيع بالتساوي. لنقسم نسأل جدول الضرب: ١٢ ÷ ٣ = ٤ لأن ٣ × ٤ = ١٢ 🍬',
      say: 'في فصل القسمة نوزّع الأشياء بالتساوي. لكي نقسم، نسأل جدول الضرب. مثلاً: اثنا عشر مقسوماً على ثلاثة يساوي أربعة، لأن ثلاثة في أربعة يساوي اثني عشر.',
    },
    en: {
      text: 'Division means sharing equally. To divide, ask the times table: 12 ÷ 3 = 4 because 3 × 4 = 12 🍬',
      say: 'In the division chapter we share things equally. To divide, we ask the times table. For example, twelve divided by three is four, because three times four is twelve.',
    },
  },
  ch4: {
    ar: {
      text: 'الجمع والطرح الرأسي: نبدأ من الآحاد ثم العشرات ثم المئات. إذا زاد المجموع عن ٩ نحمل ١، وإذا لم نستطع الطرح نستلف من الخانة المجاورة 🏴‍☠️',
      say: 'في هذا الفصل نجمع ونطرح الأعداد الكبيرة رأسياً. نبدأ دائماً من خانة الآحاد، ثم العشرات، ثم المئات. إذا زاد المجموع عن تسعة نحمل واحداً للخانة التالية، وإذا لم نستطع الطرح نستلف من الخانة المجاورة.',
    },
    en: {
      text: 'Column adding and subtracting: start with the ones, then tens, then hundreds. Over 9? Carry 1. Too small to subtract? Borrow from the next column 🏴‍☠️',
      say: 'In this chapter we add and subtract big numbers in columns. Always start with the ones, then the tens, then the hundreds. If a sum is more than nine, carry one to the next column. If we cannot subtract, we borrow from the next column.',
    },
  },
  ch5: {
    ar: {
      text: 'الطول: ١ متر = ١٠٠ سنتيمتر، و١ كيلومتر = ١٠٠٠ متر. نستخدم الكيلومتر للمسافات الطويلة بين الأماكن 📏',
      say: 'في فصل الطول نقيس بالسنتيمتر والمتر والكيلومتر. المتر يساوي مئة سنتيمتر، والكيلومتر يساوي ألف متر. ونستخدم الكيلومتر للمسافات الطويلة بين الأماكن.',
    },
    en: {
      text: 'Length: 1 metre = 100 centimetres and 1 kilometre = 1000 metres. We use kilometres for long distances between places 📏',
      say: 'In the length chapter we measure in centimetres, metres and kilometres. One metre is one hundred centimetres, and one kilometre is one thousand metres. We use kilometres for long distances between places.',
    },
  },
  ch6: {
    ar: {
      text: 'الجداول والأعمدة البيانية: نعدّ العلامات في مجموعات من ٥، وننظر إلى طول العمود ومقياس الرسم لنعرف العدد 📊',
      say: 'في هذا الفصل نقرأ الجداول والأعمدة البيانية. نعدّ العلامات في مجموعات من خمسة، وننظر إلى طول كل عمود ومقياس الرسم لنعرف العدد.',
    },
    en: {
      text: 'Tables and bar graphs: count tally marks in groups of 5, and look at the bar height and the scale to find the number 📊',
      say: 'In this chapter we read tables and bar graphs. We count tally marks in groups of five, and we look at the height of each bar and the scale to find the number.',
    },
  },
  ch7: {
    ar: {
      text: 'الحساب الذهني: نجزّئ العدد إلى عشرات وآحاد. ٣٥ + ٢٤ = ٥٠ + ٩ = ٥٩. هيا نتسابق! 🏎️',
      say: 'في الحساب الذهني نحسب في رؤوسنا بسرعة. نجزّئ العدد إلى عشرات وآحاد. مثلاً: خمسة وثلاثون زائد أربعة وعشرين: نجمع العشرات، ثم الآحاد. هيا نتسابق!',
    },
    en: {
      text: 'Mental math: split numbers into tens and ones. 35 + 24 = 50 + 9 = 59. Let’s race! 🏎️',
      say: 'In mental math we calculate quickly in our heads. We split numbers into tens and ones. For example, thirty five plus twenty four: add the tens, then the ones. Let’s race!',
    },
  },
  ch8: {
    ar: {
      text: 'القسمة مع الباقي: أحياناً يتبقى شيء بعد التوزيع. ١٤ ÷ ٣ = ٤ والباقي ٢. الباقي دائماً أصغر من المقسوم عليه 🚚',
      say: 'في القسمة مع الباقي، أحياناً يتبقى شيء بعد التوزيع بالتساوي. مثلاً: أربعة عشر مقسوماً على ثلاثة يساوي أربعة، والباقي اثنان. والباقي يجب أن يكون دائماً أصغر من المقسوم عليه.',
    },
    en: {
      text: 'Division with remainders: sometimes some are left over. 14 ÷ 3 = 4 remainder 2. The remainder is always smaller than the number we divide by 🚚',
      say: 'In division with remainders, sometimes something is left over after sharing equally. For example, fourteen divided by three is four, remainder two. The remainder must always be smaller than the number we divide by.',
    },
  },
  ch9: {
    ar: {
      text: 'الأعداد الكبيرة: لكل رقم قيمة حسب خانته: آحاد، عشرات، مئات، ألوف، عشرات ألوف. وعند الضرب في ١٠ نضع صفراً على اليمين 🚀',
      say: 'في هذا الفصل نتعرف على الأعداد الأكبر من عشرة آلاف. لكل رقم قيمة حسب خانته: آحاد، عشرات، مئات، ألوف، وعشرات ألوف. وعندما نضرب في عشرة، نضع صفراً على اليمين.',
    },
    en: {
      text: 'Big numbers: each digit’s value depends on its place: ones, tens, hundreds, thousands, ten thousands. Times 10? Put a zero on the right 🚀',
      say: 'In this chapter we meet numbers bigger than ten thousand. Each digit has a value that depends on its place: ones, tens, hundreds, thousands and ten thousands. When we multiply by ten, we put a zero on the right.',
    },
  },
  ch10: {
    ar: {
      text: 'الضرب الرأسي: نضرب الآحاد أولاً، ثم العشرات، ثم المئات. إذا زاد الناتج عن ٩ نحمل العشرات للخانة التالية 🤖',
      say: 'في الضرب الرأسي نضرب رقم الآحاد أولاً، ثم العشرات، ثم المئات. وإذا كان الناتج أكبر من تسعة، نحمل العشرات إلى الخانة التالية.',
    },
    en: {
      text: 'Column multiplication: multiply the ones first, then the tens, then the hundreds. Over 9? Carry the tens to the next column 🤖',
      say: 'In column multiplication we multiply the ones first, then the tens, then the hundreds. If the answer is more than nine, we carry the tens to the next column.',
    },
  },
};
