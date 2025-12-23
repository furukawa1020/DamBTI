import axios from 'axios';
import * as cheerio from 'cheerio';

// 複数のデータソースから実際のダムデータを取得
// - 国土交通省 川の防災情報
// - 国土交通省 水文水質データベース
// - 水資源機構
// - 各地方整備局のダム情報
// - 電力会社の公開データ

interface DamRealtimeData {
    storagePercent?: number;
    inflow?: number;
    outflow?: number;
    time?: string;
}

// 川の防災情報APIで使用される観測所コード
// http://www.river.go.jp/portal/ のデータを使用
const RIVER_INFO_MAP: Record<string, { obsrvtnId: string; type: string }> = {
    // 北海道開発局管内
    '夕張シューパロダム': { obsrvtnId: '0201300702003', type: 'dam' },
    '金山ダム': { obsrvtnId: '0201300702004', type: 'dam' },
    '滝里ダム': { obsrvtnId: '0201300702005', type: 'dam' },
    '桂沢ダム': { obsrvtnId: '0201300702001', type: 'dam' },
    '漁川ダム': { obsrvtnId: '0201300702006', type: 'dam' },
    '豊平峡ダム': { obsrvtnId: '0201100702001', type: 'dam' },
    '定山渓ダム': { obsrvtnId: '0201100702002', type: 'dam' },
    '美利河ダム': { obsrvtnId: '0201400702001', type: 'dam' },
    '二風谷ダム': { obsrvtnId: '0201500702001', type: 'dam' },
    
    // 東北地方整備局管内
    '津軽ダム': { obsrvtnId: '0302100702001', type: 'dam' },
    '浅瀬石川ダム': { obsrvtnId: '0302100702002', type: 'dam' },
    '四十四田ダム': { obsrvtnId: '0303100702001', type: 'dam' },
    '御所ダム': { obsrvtnId: '0303100702002', type: 'dam' },
    '田瀬ダム': { obsrvtnId: '0303100702003', type: 'dam' },
    '湯田ダム': { obsrvtnId: '0303100702004', type: 'dam' },
    '胆沢ダム': { obsrvtnId: '0303100702005', type: 'dam' },
    '鳴子ダム': { obsrvtnId: '0304100702001', type: 'dam' },
    '釜房ダム': { obsrvtnId: '0304100702002', type: 'dam' },
    '七ヶ宿ダム': { obsrvtnId: '0304100702003', type: 'dam' },
    '玉川ダム': { obsrvtnId: '0305100702001', type: 'dam' },
    '白川ダム': { obsrvtnId: '0306100702001', type: 'dam' },
    '寒河江ダム': { obsrvtnId: '0306100702002', type: 'dam' },
    '月山ダム': { obsrvtnId: '0306100702003', type: 'dam' },
    '長井ダム': { obsrvtnId: '0306100702004', type: 'dam' },
    '摺上川ダム': { obsrvtnId: '0307100702001', type: 'dam' },
    '三春ダム': { obsrvtnId: '0307100702002', type: 'dam' },
    
    // 関東地方整備局管内
    '矢木沢ダム': { obsrvtnId: '0403100702001', type: 'dam' },
    '藤原ダム': { obsrvtnId: '0403100702002', type: 'dam' },
    '奈良俣ダム': { obsrvtnId: '0403100702003', type: 'dam' },
    '相俣ダム': { obsrvtnId: '0403100702004', type: 'dam' },
    '薗原ダム': { obsrvtnId: '0403100702005', type: 'dam' },
    '下久保ダム': { obsrvtnId: '0403100702006', type: 'dam' },
    '草木ダム': { obsrvtnId: '0403100702007', type: 'dam' },
    '渡良瀬貯水池': { obsrvtnId: '0403100702008', type: 'dam' },
    '八ッ場ダム': { obsrvtnId: '0403100702009', type: 'dam' },
    '二瀬ダム': { obsrvtnId: '0403200702001', type: 'dam' },
    '浦山ダム': { obsrvtnId: '0403200702002', type: 'dam' },
    '滝沢ダム': { obsrvtnId: '0403200702003', type: 'dam' },
    '宮ヶ瀬ダム': { obsrvtnId: '0404100702001', type: 'dam' },
    
    // 北陸地方整備局管内
    '横川ダム': { obsrvtnId: '0504100702001', type: 'dam' },
    '大川ダム': { obsrvtnId: '0504100702002', type: 'dam' },
    '宇奈月ダム': { obsrvtnId: '0505100702001', type: 'dam' },
    '手取川ダム': { obsrvtnId: '0506100702001', type: 'dam' },
    '九頭竜ダム': { obsrvtnId: '0507100702001', type: 'dam' },
    '真名川ダム': { obsrvtnId: '0507100702002', type: 'dam' },
    '笹生川ダム': { obsrvtnId: '0507100702003', type: 'dam' },
    '足羽川ダム': { obsrvtnId: '0507100702004', type: 'dam' },
    
    // 中部地方整備局管内
    '大町ダム': { obsrvtnId: '0603100702001', type: 'dam' },
    '奈川渡ダム': { obsrvtnId: '0603100702002', type: 'dam' },
    '水殿ダム': { obsrvtnId: '0603100702003', type: 'dam' },
    '稲核ダム': { obsrvtnId: '0603100702004', type: 'dam' },
    '小渋ダム': { obsrvtnId: '0604100702001', type: 'dam' },
    '美和ダム': { obsrvtnId: '0604100702002', type: 'dam' },
    
    // 近畿地方整備局管内
    '日吉ダム': { obsrvtnId: '0703100702001', type: 'dam' },
    '比奈知ダム': { obsrvtnId: '0704100702001', type: 'dam' },
    '蓮ダム': { obsrvtnId: '0704100702002', type: 'dam' },
    '青蓮寺ダム': { obsrvtnId: '0704100702003', type: 'dam' },
    '室生ダム': { obsrvtnId: '0704100702004', type: 'dam' },
    '布目ダム': { obsrvtnId: '0704100702005', type: 'dam' },
    '高山ダム': { obsrvtnId: '0704100702006', type: 'dam' },
    '一庫ダム': { obsrvtnId: '0705100702001', type: 'dam' },
    '大滝ダム': { obsrvtnId: '0706100702001', type: 'dam' },
    '猿谷ダム': { obsrvtnId: '0706100702002', type: 'dam' },
    
    // 中国地方整備局管内
    '殿ダム': { obsrvtnId: '0803100702001', type: 'dam' },
    '菅沢ダム': { obsrvtnId: '0803100702002', type: 'dam' },
    '尾原ダム': { obsrvtnId: '0803100702003', type: 'dam' },
    '志津見ダム': { obsrvtnId: '0803100702004', type: 'dam' },
    '土師ダム': { obsrvtnId: '0804100702001', type: 'dam' },
    '灰塚ダム': { obsrvtnId: '0804100702002', type: 'dam' },
    '温井ダム': { obsrvtnId: '0804100702003', type: 'dam' },
    '弥栄ダム': { obsrvtnId: '0805100702001', type: 'dam' },
    '島地川ダム': { obsrvtnId: '0805100702002', type: 'dam' },
    '小瀬川ダム': { obsrvtnId: '0805100702003', type: 'dam' },
    '苫田ダム': { obsrvtnId: '0806100702001', type: 'dam' },
    '河本ダム': { obsrvtnId: '0806100702002', type: 'dam' },
    
    // 四国地方整備局管内
    '早明浦ダム': { obsrvtnId: '0903100702001', type: 'dam' },
    '大渡ダム': { obsrvtnId: '0903100702002', type: 'dam' },
    '池田ダム': { obsrvtnId: '0904100702001', type: 'dam' },
    '富郷ダム': { obsrvtnId: '0904100702002', type: 'dam' },
    '柳瀬ダム': { obsrvtnId: '0904100702003', type: 'dam' },
    '新宮ダム': { obsrvtnId: '0904100702004', type: 'dam' },
    '長安口ダム': { obsrvtnId: '0904100702005', type: 'dam' },
    '石手川ダム': { obsrvtnId: '0905100702001', type: 'dam' },
    '鹿野川ダム': { obsrvtnId: '0905100702002', type: 'dam' },
    '野村ダム': { obsrvtnId: '0905100702003', type: 'dam' },
    '中筋川ダム': { obsrvtnId: '0906100702001', type: 'dam' },
    '横瀬川ダム': { obsrvtnId: '0906100702002', type: 'dam' },
    
    // 九州地方整備局管内
    '耶馬溪ダム': { obsrvtnId: '1003100702001', type: 'dam' },
    '下筌ダム': { obsrvtnId: '1003100702002', type: 'dam' },
    '松原ダム': { obsrvtnId: '1003100702003', type: 'dam' },
    '寺内ダム': { obsrvtnId: '1003100702004', type: 'dam' },
    '厳木ダム': { obsrvtnId: '1004100702001', type: 'dam' },
    '嘉瀬川ダム': { obsrvtnId: '1004100702002', type: 'dam' },
    '本明川ダム': { obsrvtnId: '1004100702003', type: 'dam' },
    '緑川ダム': { obsrvtnId: '1005100702001', type: 'dam' },
    '竜門ダム': { obsrvtnId: '1005100702002', type: 'dam' },
    '鶴田ダム': { obsrvtnId: '1006100702001', type: 'dam' },
};

// 水資源機構管理ダム
const WATER_RESOURCES_MAP: Record<string, string> = {
    '徳山ダム': 'tokuyama',
    '木曽川用水': 'kisogawa',
    '愛知用水': 'aichi',
    '長良川河口堰': 'nagaragawa',
    '味噌川ダム': 'misogawa',
    '牧尾ダム': 'makio',
    '阿木川ダム': 'akigawa',
    '岩屋ダム': 'iwaya',
    '横山ダム': 'yokoyama',
    '蓮ダム': 'hachisu',
    '木津川ダム': 'kizugawa',
    '比奈知ダム': 'hinachi',
    '高山ダム': 'takayama',
    '青蓮寺ダム': 'shorenji',
    '室生ダム': 'muro',
    '布目ダム': 'nunome',
    '一庫ダム': 'hitokura',
    '琵琶湖': 'biwako',
    '日吉ダム': 'hiyoshi',
    '利根川': 'tone',
    '矢木沢ダム': 'yagisawa',
    '奈良俣ダム': 'naramata',
    '藤原ダム': 'fujiwara',
    '相俣ダム': 'aimata',
    '薗原ダム': 'sonohara',
    '下久保ダム': 'shimokubo',
    '草木ダム': 'kusaki',
    '渡良瀬貯水池': 'watarase',
    '霞ヶ浦': 'kasumigaura',
    '霞ヶ浦用水': 'kasumigaura_water',
    '利根導水': 'tone_water',
    '荒川': 'arakawa',
    '浦山ダム': 'urayama',
    '滝沢ダム': 'takizawa',
    '二瀬ダム': 'futase',
    '宮ヶ瀬ダム': 'miyagase',
    '相模ダム': 'sagami',
    '城山ダム': 'shiroyama',
    '豊川用水': 'toyogawa',
    '寒河江ダム': 'sagae',
    '玉川ダム': 'tamagawa',
    '森吉山ダム': 'moriyoshiyama',
    '田瀬ダム': 'tase',
    '湯田ダム': 'yuda',
    '石淵ダム': 'ishifuchi',
    '胆沢ダム': 'isawa',
};

// 川の防災情報APIからデータを取得
async function fetchFromRiverInfo(obsrvtnId: string): Promise<DamRealtimeData | null> {
    try {
        // 川の防災情報のリアルタイムデータAPI
        const url = `http://www.river.go.jp/portal/js/damData.js`;
        
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // JSONPレスポンスをパース
        const jsonMatch = response.data.match(/damData\s*=\s*(\{[\s\S]*\});/);
        if (!jsonMatch) return null;

        const damData = JSON.parse(jsonMatch[1]);
        
        // 観測所IDでダムデータを検索
        const damInfo = damData[obsrvtnId];
        if (!damInfo) return null;

        return {
            storagePercent: damInfo.per ? parseFloat(damInfo.per) : undefined,
            inflow: damInfo.inflow ? parseFloat(damInfo.inflow) : undefined,
            outflow: damInfo.outflow ? parseFloat(damInfo.outflow) : undefined,
            time: damInfo.tm ? damInfo.tm : undefined
        };
    } catch (err) {
        console.error(`Failed to fetch from River Info for ${obsrvtnId}:`, err);
        return null;
    }
}

// 水資源機構のデータを取得
async function fetchFromWaterResources(damCode: string): Promise<DamRealtimeData | null> {
    try {
        const url = `https://www.water.go.jp/honsya/honsya/torikumi/dam/realtime/${damCode}.html`;
        
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        
        let storagePercent: number | undefined;
        let inflow: number | undefined;
        let outflow: number | undefined;
        let time: string | undefined;

        // 貯水率を抽出
        $('table tr').each((i, row) => {
            const cells = $(row).find('td');
            const label = cells.eq(0).text().trim();
            
            if (label.includes('貯水率')) {
                const value = cells.eq(1).text().trim();
                const match = value.match(/(\d+\.?\d*)/);
                if (match) storagePercent = parseFloat(match[1]);
            } else if (label.includes('流入量')) {
                const value = cells.eq(1).text().trim();
                const match = value.match(/(\d+\.?\d*)/);
                if (match) inflow = parseFloat(match[1]);
            } else if (label.includes('放流量')) {
                const value = cells.eq(1).text().trim();
                const match = value.match(/(\d+\.?\d*)/);
                if (match) outflow = parseFloat(match[1]);
            }
        });

        const timeText = $('body').text();
        const timeMatch = timeText.match(/(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})\s*(\d{1,2}):(\d{2})/);
        if (timeMatch) {
            time = `${timeMatch[1]}-${timeMatch[2].padStart(2, '0')}-${timeMatch[3].padStart(2, '0')} ${timeMatch[4].padStart(2, '0')}:${timeMatch[5]}`;
        }

        if (storagePercent !== undefined || inflow !== undefined || outflow !== undefined) {
            return { storagePercent, inflow, outflow, time };
        }

        return null;
    } catch (err) {
        console.error(`Failed to fetch from Water Resources for ${damCode}:`, err);
        return null;
    }
}
// 国交省ダム諸量データベースからデータを取得
async function fetchFromMLIT(damName: string): Promise<DamRealtimeData | null> {
    try {
        // 国交省の各地方整備局のダムデータページを試行
        const urls = [
            `http://www1.river.go.jp/cgi-bin/DamData/dam_data.cgi?dam=${encodeURIComponent(damName)}`,
            `http://www.river.go.jp/kawabou/ipDamData.do?init=init&obsrvId=${encodeURIComponent(damName)}`,
        ];

        for (const url of urls) {
            try {
                const response = await axios.get(url, {
                    timeout: 8000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                const $ = cheerio.load(response.data);
                
                let storagePercent: number | undefined;
                let inflow: number | undefined;
                let outflow: number | undefined;
                let time: string | undefined;

                // テーブルからデータを抽出
                $('table tr, table.data tr').each((i, row) => {
                    const cells = $(row).find('td, th');
                    cells.each((j, cell) => {
                        const text = $(cell).text().trim();
                        const nextCell = cells.eq(j + 1);
                        const value = nextCell.text().trim();

                        if (text.includes('貯水率') || text.includes('貯水位')) {
                            const match = value.match(/(\d+\.?\d*)/);
                            if (match) storagePercent = parseFloat(match[1]);
                        } else if (text.includes('流入量')) {
                            const match = value.match(/(\d+\.?\d*)/);
                            if (match) inflow = parseFloat(match[1]);
                        } else if (text.includes('放流量') || text.includes('全放流')) {
                            const match = value.match(/(\d+\.?\d*)/);
                            if (match && outflow === undefined) outflow = parseFloat(match[1]);
                        }
                    });
                });

                // 更新時刻を抽出
                const bodyText = $('body').text();
                const timeMatch = bodyText.match(/(\d{4})[\/-年](\d{1,2})[\/-月](\d{1,2})[日\s]*(\d{1,2}):(\d{2})/);
                if (timeMatch) {
                    time = `${timeMatch[1]}-${timeMatch[2].padStart(2, '0')}-${timeMatch[3].padStart(2, '0')} ${timeMatch[4].padStart(2, '0')}:${timeMatch[5]}`;
                }

                if (storagePercent !== undefined || inflow !== undefined || outflow !== undefined) {
                    return { storagePercent, inflow, outflow, time };
                }
            } catch (err) {
                // このURLでは取得できなかったので次を試す
                continue;
            }
        }

        return null;
    } catch (err) {
        console.error(`Failed to fetch from MLIT for ${damName}:`, err);
        return null;
    }
}

// 電力会社の公開データから取得（主要な電力ダム）
async function fetchFromPowerCompany(damName: string): Promise<DamRealtimeData | null> {
    try {
        const powerDams: Record<string, { company: string; url: string }> = {
            '黒部ダム': { 
                company: 'kepco', 
                url: 'https://www.kepco.co.jp/energy_supply/energy/newenergy/water/kurobe/'
            },
            '奥只見ダム': { 
                company: 'jpower', 
                url: 'http://www.jpower.co.jp/bs/karyoku/dambinran/detail/okutadami.html'
            },
            '田子倉ダム': { 
                company: 'jpower', 
                url: 'http://www.jpower.co.jp/bs/karyoku/dambinran/detail/tagokura.html'
            },
        };

        const damInfo = powerDams[damName];
        if (!damInfo) return null;

        const response = await axios.get(damInfo.url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        
        let storagePercent: number | undefined;
        let time: string | undefined;

        // 電力会社のサイトは通常、貯水率程度しか公開していない
        $('.dam-data, .realtime-data, table').each((i, elem) => {
            const text = $(elem).text();
            const percentMatch = text.match(/貯水率[：:]\s*(\d+\.?\d*)%/);
            if (percentMatch) {
                storagePercent = parseFloat(percentMatch[1]);
            }
        });

        const bodyText = $('body').text();
        const timeMatch = bodyText.match(/(\d{4})[\/-年](\d{1,2})[\/-月](\d{1,2})[日\s]*(\d{1,2}):(\d{2})/);
        if (timeMatch) {
            time = `${timeMatch[1]}-${timeMatch[2].padStart(2, '0')}-${timeMatch[3].padStart(2, '0')} ${timeMatch[4].padStart(2, '0')}:${timeMatch[5]}`;
        }

        if (storagePercent !== undefined) {
            return { storagePercent, time };
        }

        return null;
    } catch (err) {
        console.error(`Failed to fetch from power company for ${damName}:`, err);
        return null;
    }
}

export async function fetchRealtimeDamData(damName: string): Promise<DamRealtimeData | null> {
    // 複数のデータソースを順番に試行
    
    // 1. 川の防災情報API（最も信頼性が高い）
    const riverInfo = RIVER_INFO_MAP[damName];
    if (riverInfo) {
        const data = await fetchFromRiverInfo(riverInfo.obsrvtnId);
        if (data) return data;
    }

    // 2. 水資源機構のデータ
    const waterResourcesCode = WATER_RESOURCES_MAP[damName];
    if (waterResourcesCode) {
        const data = await fetchFromWaterResources(waterResourcesCode);
        if (data) return data;
    }

    // 3. 国交省ダム諸量データベース
    const mlitData = await fetchFromMLIT(damName);
    if (mlitData) return mlitData;

    // 4. 電力会社の公開データ
    const powerData = await fetchFromPowerCompany(damName);
    if (powerData) return powerData;

    // すべてのデータソースで取得できなかった場合はnullを返す
    return null;
}
