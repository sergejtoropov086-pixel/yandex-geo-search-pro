document.getElementById('searchBtn').addEventListener('click', searchAddress);

async function searchAddress() {
    const address = document.getElementById('addressInput').value.trim();
    if (!address) {
        alert('Пожалуйста, введите адрес');
        return;
    }

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<p>🔍 Ищем...</p>';

    try {
        // Ваш API ключ Яндекс Геокодера
        const apiKey = '5fbee5d2-b168-4e9a-86f9-a9509a28d2e6';
        
        const url = `https://geocode-maps.yandex.ru/1.x/?format=json&apikey=${apiKey}&geocode=${encodeURIComponent(address)}&lang=ru_RU`;

        const response = await fetch(url);
        const data = await response.json();

        // Проверка структуры ответа
        if (!data || !data.response || !data.response.GeoObjectCollection) {
            throw new Error('API вернул некорректные данные. Проверьте ключ или запрос.');
        }

        const featureMembers = data.response.GeoObjectCollection.featureMember;

        if (!featureMembers || featureMembers.length === 0) {
            resultsDiv.innerHTML = '<p>❌ Адрес не найден. Попробуйте уточнить запрос.</p>';
            return;
        }

        let html = '';
        featureMembers.forEach(item => {
            if (!item || !item.GeoObject) return;

            const obj = item.GeoObject;
            const name = obj.name || 'Без названия';
            const addressStr = obj.description || 'Адрес не указан';

            if (!obj.Point || !obj.Point.pos) {
                html += `
                    <div class="result-item">
                        <h3>${name}</h3>
                        <p><strong>Адрес:</strong> ${addressStr}</p>
                        <p>⚠️ Координаты недоступны</p>
                    </div>
                `;
                return;
            }

            const coords = obj.Point.pos.split(' ');
            const lon = coords[0];
            const lat = coords[1];

            html += `
                <div class="result-item">
                    <h3>${name}</h3>
                    <p><strong>Адрес:</strong> ${addressStr}</p>
                    <p><strong>Координаты:</strong> Широта: ${lat}, Долгота: ${lon}</p>
                    <p><strong>Ссылка на карту:</strong> <a href="https://yandex.ru/maps/?pt=${lon},${lat}&z=16&l=map" target="_blank">Открыть на Яндекс Картах</a></p>
                    <button class="copy-btn" onclick="copyCoords('${lat}', '${lon}')">Копировать координаты</button>
                </div>
            `;
        });

        resultsDiv.innerHTML = html;

    } catch (error) {
        console.error('Ошибка при поиске:', error);
        resultsDiv.innerHTML = `<p>❌ Ошибка: ${error.message}</p>`;
    }
}

function copyCoords(lat, lon) {
    const text = `${lat}, ${lon}`;
    navigator.clipboard.writeText(text).then(() => {
        alert(`✅ Координаты скопированы: ${text}`);
    }).catch(err => {
        alert('❌ Не удалось скопировать: ' + err);
    });
}
