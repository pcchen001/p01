const STORAGE_KEY = "daily_log_entries";

    const titleInput = document.getElementById("title");
    const timeInput = document.getElementById("time");
    const contentInput = document.getElementById("content");
    const addBtn = document.getElementById("addBtn");
    const clearBtn = document.getElementById("clearBtn");
    const countText = document.getElementById("countText");
    const logList = document.getElementById("logList");

    function nowLocalValue() {
      const d = new Date();
      const tzOffset = d.getTimezoneOffset();
      const local = new Date(d.getTime() - tzOffset * 60000);
      return local.toISOString().slice(0, 16);
    }

    function loadEntries() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    function saveEntries(entries) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }

    function formatDate(value) {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return value;
      return d.toLocaleString("zh-TW", { hour12: false });
    }

    function escapeHtml(text) {
      return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
    }

    function render(entries) {
      countText.textContent = `目前共有 ${entries.length} 筆紀錄`;

      if (!entries.length) {
        logList.innerHTML = '<div class="empty">尚無紀錄，請先新增一筆。</div>';
        return;
      }

      logList.innerHTML = entries
        .map((entry) => {
          return `
            <article class="item">
              <div class="item-head">
                <div>
                  <div class="title">${escapeHtml(entry.title || "未命名紀錄")}</div>
                  <div class="time">${escapeHtml(formatDate(entry.time))}</div>
                </div>
                <button class="delete" data-id="${entry.id}" type="button">刪除</button>
              </div>
              <p class="content">${escapeHtml(entry.content)}</p>
            </article>
          `;
        })
        .join("");
    }

    function addEntry() {
      const title = titleInput.value.trim();
      const time = timeInput.value || nowLocalValue();
      const content = contentInput.value.trim();

      if (!content) {
        alert("請先輸入內容");
        contentInput.focus();
        return;
      }

      const entries = loadEntries();
      entries.unshift({
        id: crypto.randomUUID(),
        title,
        time,
        content,
      });

      saveEntries(entries);
      render(entries);

      titleInput.value = "";
      contentInput.value = "";
      timeInput.value = nowLocalValue();
      contentInput.focus();
    }

    function deleteEntry(id) {
      const entries = loadEntries().filter((entry) => entry.id !== id);
      saveEntries(entries);
      render(entries);
    }

    function clearAll() {
      if (!confirm("確定要清空所有紀錄嗎？")) return;
      localStorage.removeItem(STORAGE_KEY);
      render([]);
    }

    addBtn.addEventListener("click", addEntry);
    clearBtn.addEventListener("click", clearAll);

    logList.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) return;
      if (!target.classList.contains("delete")) return;
      deleteEntry(target.dataset.id);
    });

    timeInput.value = nowLocalValue();
    render(loadEntries());
