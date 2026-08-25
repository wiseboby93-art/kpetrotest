const fileNames = [
    "260520_중앙재난안전대책본부첫가동.md",
    "260522a_폭염취약계층지원점검.md",
    "260522b_캠핑화재안전.md",
    "260523a_방재의날.md",
    "260523b_안전체험교실.md",
    "260525_호우대비관계기관점검.md",
    "260526a_소하천불법점용즉각조치.md",
    "260526b_생명안전기본법제정.md",
    "260526c_어린이보호구역교통사고저감.md",
    "260529_빗물받이시설관리.md",
    "보도자료_125874.md",
    "보도자료_125875.md",
    "보도자료_125915.md",
    "보도자료_125917.md",
    "보도자료_125924.md",
    "보도자료_126412.md"
];

let allData = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadAllFiles();
    renderCards(allData);
    
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
});

async function loadAllFiles() {
    try {
        const fetchPromises = fileNames.map(async (fileName) => {
            const response = await fetch(`./보도자료/${fileName}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const text = await response.text();
            
            const { title, summary } = parseMarkdown(text);
            return {
                fileName,
                title,
                summary,
                content: text
            };
        });
        allData = await Promise.all(fetchPromises);
    } catch (error) {
        console.error("파일 로드 중 오류 발생:", error);
        document.getElementById('cardContainer').innerHTML = '<p>데이터를 불러오는 중 오류가 발생했습니다. 서버 환경에서 실행해주세요.</p>';
    }
}

function parseMarkdown(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let title = "제목 없음";
    let summary = "";
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('<!--') || line.includes('보도자료') || line.includes('보도시점')) {
            continue;
        }
        
        if (title === "제목 없음") {
            title = line;
            if (i + 1 < lines.length && !lines[i+1].includes('행정안전부')) {
                title += " " + lines[i+1];
                i++;
            }
        } else {
            summary += line + " ";
            if (summary.length > 200) break; 
        }
    }
    
    return { title, summary: summary.trim() };
}

function renderCards(data, keyword = '') {
    const container = document.getElementById('cardContainer');
    const resultCount = document.getElementById('resultCount');
    
    container.innerHTML = '';
    resultCount.textContent = `결과 ${data.length}건`;
    
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        
        let displayTitle = item.title;
        let displaySummary = item.summary;
        
        if (keyword) {
            const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const safeKeyword = escapeRegExp(keyword);
            const regex = new RegExp(`(${safeKeyword})`, 'gi');
            displayTitle = displayTitle.replace(regex, '<span class="highlight">$1</span>');
            displaySummary = displaySummary.replace(regex, '<span class="highlight">$1</span>');
        }
        
        card.innerHTML = `
            <div class="card-title">${displayTitle}</div>
            <div class="card-summary">${displaySummary}</div>
        `;
        
        container.appendChild(card);
    });
}

function handleSearch() {
    const keyword = document.getElementById('searchInput').value.trim();
    if (!keyword) {
        renderCards(allData);
        return;
    }
    
    const lowerKeyword = keyword.toLowerCase();
    const filteredData = allData.filter(item => 
        item.title.toLowerCase().includes(lowerKeyword) || 
        item.content.toLowerCase().includes(lowerKeyword)
    );
    
    renderCards(filteredData, keyword);
}
