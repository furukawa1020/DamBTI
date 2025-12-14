import { Question } from './types';

export const QUESTIONS: Question[] = [
    // --- Category A: Storage / Pace ---
    {
        id: 'Q1',
        category: 'A',
        text: '普段、予定やタスクはどういう状態のときが一番落ち着く？',
        choices: [
            { key: 'A', text: '余裕をかなり残しておきたい', effects: { storage: 15, stability: 10 } },
            { key: 'B', text: 'ほどほどに埋まっているのがちょうどいい', effects: { storage: 5 } },
            { key: 'C', text: 'けっこうパンパンになってから本気出す', effects: { storage: -10, release: 5 } },
            { key: 'D', text: 'その日その日でムラがある', effects: { storage: 0, stability: -10 } }
        ]
    },
    {
        id: 'Q2',
        category: 'A',
        text: '新しいことを始めるとき、どんなスタートが多い？',
        choices: [
            { key: 'A', text: 'ちょっとずつ様子を見ながら始める', effects: { input: -5, stability: 5 } },
            { key: 'B', text: '必要なものを揃えてから一気に始める', effects: { storage: 10 } },
            { key: 'C', text: 'ノリと勢いで、とりあえず動きながら考える', effects: { input: 10, release: 5 } }
        ]
    },
    {
        id: 'Q3',
        category: 'A',
        text: '頼まれごとや仕事が積み上がってきたときの感覚は？',
        choices: [
            { key: 'A', text: 'こまめに処理して、あまり溜めないようにする', effects: { storage: -5, stability: 10 } },
            { key: 'B', text: 'ある程度溜まってからまとめて片付ける', effects: { storage: 10 } },
            { key: 'C', text: '気づいたら山になっていて、そこから一気に片付ける', effects: { storage: 15, release: 10 } }
        ]
    },
    {
        id: 'Q4',
        category: 'A',
        text: '「余白」についてどう感じる？',
        choices: [
            { key: 'A', text: '余白がないと不安になる', effects: { storage: 10 } },
            { key: 'B', text: '多少の余白があれば大丈夫', effects: { storage: 5 } },
            { key: 'C', text: '余白があると逆に落ち着かないことがある', effects: { storage: -10, input: 5 } }
        ]
    },
    // --- Category B: Release / Output ---
    {
        id: 'Q5',
        category: 'B',
        text: 'アイデアや成果物を人に見せるタイミングは？',
        choices: [
            { key: 'A', text: 'できたらすぐ見せる', effects: { release: 15 } },
            { key: 'B', text: 'ある程度整えてから見せる', effects: { release: 5 } },
            { key: 'C', text: '完成度がかなり高くなるまで見せない', effects: { release: -10, stability: 5 } }
        ]
    },
    {
        id: 'Q6',
        category: 'B',
        text: 'ちょっとしんどい感情やモヤモヤが溜まったときは？',
        choices: [
            { key: 'A', text: 'すぐ誰かに話したり、何かに書いて外に出す', effects: { release: 10, input: 5 } },
            { key: 'B', text: 'しばらく自分の中で温めてから整理して出す', effects: { release: 0 } },
            { key: 'C', text: 'だいぶ溢れてからまとめて処理する／そもそもあまり出さない', effects: { release: -10, stability: 10 } }
        ]
    },
    {
        id: 'Q7',
        category: 'B',
        text: '集中して作業したとき、その後どうなる？',
        choices: [
            { key: 'A', text: 'ちょこちょこ休みながら続けるタイプ', effects: { release: 5, stability: 5 } },
            { key: 'B', text: '一気にやって、そのあとはしばらく動けなくなる', effects: { release: 15, stability: -5 } },
            { key: 'C', text: '集中と休憩の波を何度も繰り返すのが普通', effects: { release: 0 } }
        ]
    },
    {
        id: 'Q8',
        category: 'B',
        text: '自分のペースが乱れたとき、戻し方は？',
        choices: [
            { key: 'A', text: 'まず小さいところから整え直す', effects: { stability: 10 } },
            { key: 'B', text: '大掃除みたいに一気にリセットしたくなる', effects: { release: 10, stability: -5 } },
            { key: 'C', text: 'いつの間にか戻っているのであまり気にしない', effects: { stability: 0 } }
        ]
    },
    // --- Category C: Input Response ---
    {
        id: 'Q9',
        category: 'C',
        text: '急な予定変更やトラブルが入ったときの反応は？',
        choices: [
            { key: 'A', text: 'すぐ対応モードに切り替える', effects: { input: 15 } },
            { key: 'B', text: 'いったん状況を整理してから動く', effects: { input: 5 } },
            { key: 'C', text: 'かなり動揺する／しばらく固まることがある', effects: { input: -10, stability: -5 } }
        ]
    },
    {
        id: 'Q10',
        category: 'C',
        text: '周りからの刺激（誘い・イベント・話題）が多い環境は？',
        choices: [
            { key: 'A', text: '刺激が多いほうが楽しい', effects: { input: 10 } },
            { key: 'B', text: '適度なら大丈夫だが、多すぎると疲れる', effects: { input: 0 } },
            { key: 'C', text: '静かなほうが本領を発揮できる', effects: { input: -10, stability: 5 } }
        ]
    },
    {
        id: 'Q11',
        category: 'C',
        text: '「やる気スイッチ」が入るきっかけに近いのは？',
        choices: [
            { key: 'A', text: '期限やプレッシャーが見えてきたとき', effects: { input: 10 } },
            { key: 'B', text: '自分の中でイメージや見通しがはっきりしたとき', effects: { stability: 10 } },
            { key: 'C', text: '誰かとの会話や思いつきで急に火がつく', effects: { input: 15 } }
        ]
    },
    {
        id: 'Q12',
        category: 'C',
        text: '予定が立て込んで洪水のようになったとき、どうなりがち？',
        choices: [
            { key: 'A', text: '優先度を付けて冷静にさばこうとする', effects: { stability: 10 } },
            { key: 'B', text: 'どこかで一気に崩れて全部入れ替えたくなる', effects: { release: 10, stability: -5 } },
            { key: 'C', text: 'そもそもそこまで積み上げないようにする', effects: { storage: -5 } }
        ]
    },
    // --- Category D: Role / Purpose ---
    {
        id: 'Q13',
        category: 'D',
        text: '自分の行動の中で「一番大事」と感じやすいものは？',
        choices: [
            { key: 'A', text: '周りや全体の安全・安定を守ること', effects: { purpose: -10, stability: 10 } },
            { key: 'B', text: '目に見える成果やアウトプットを出すこと', effects: { purpose: -5, release: 10 } },
            { key: 'C', text: '誰かの役に立ったり、支えること', effects: { purpose: -5 } },
            { key: 'D', text: 'その場その場でいろんな役を切り替えること', effects: { purpose: 15 } }
        ]
    },
    {
        id: 'Q14',
        category: 'D',
        text: '人との関わり方で近いのは？',
        choices: [
            { key: 'A', text: '水道みたいに、必要なときに静かに支えたい', effects: { purpose: -10 } },
            { key: 'B', text: '電気みたいに、エネルギーや勢いを渡したい', effects: { purpose: -5, release: 10 } },
            { key: 'C', text: '公園の池みたいに、場そのものの雰囲気を作りたい', effects: { purpose: 5 } },
            { key: 'D', text: '特に決めず、その時の形に合わせて変わりたい', effects: { purpose: 15 } }
        ]
    },
    {
        id: 'Q15',
        category: 'D',
        text: '一つの活動やプロジェクトに対するスタンスは？',
        choices: [
            { key: 'A', text: '役割を決めて長く関わるほうが好き', effects: { stability: 10 } },
            { key: 'B', text: '集中的に力を入れて、一定のところで区切りたい', effects: { release: 10 } },
            { key: 'C', text: 'いろんまなものを横断しながらシフトしていくのが好き', effects: { purpose: 10 } }
        ]
    },
    // --- Category E: Scale / Time ---
    {
        id: 'Q16',
        category: 'E',
        text: 'どれくらいのスケールの物事がしっくりくる？',
        choices: [
            { key: 'A', text: '目の前の小さなことを確実にやる', effects: { scale: -15 } },
            { key: 'B', text: 'チームやコミュニティ単位くらいがちょうどいい', effects: { scale: 0 } },
            { key: 'C', text: 'もっと広い範囲や長期スパンで考えるのが好き', effects: { scale: 15 } }
        ]
    },
    {
        id: 'Q17',
        category: 'E',
        text: '自分の変化についての感覚は？',
        choices: [
            { key: 'A', text: 'ゆっくり少しずつ変わってきた感覚がある', effects: { stability: 10 } },
            { key: 'B', text: '何度か大きな転機・ジャンプがあった', effects: { stability: 0 } },
            { key: 'C', text: 'ふと振り返るとガラッと変わっていることが多い', effects: { stability: -10 } }
        ]
    },
    {
        id: 'Q18',
        category: 'E',
        text: '「完成」という言葉に近いイメージは？',
        choices: [
            { key: 'A', text: 'ほぼ形が変わらない安定した状態', effects: { stability: 15 } },
            { key: 'B', text: '必要になれば少しずつ手を入れていく状態', effects: { stability: 5 } },
            { key: 'C', text: '完成してもまた次の形に流れていく途中の状態', effects: { stability: -10 } }
        ]
    }
];
