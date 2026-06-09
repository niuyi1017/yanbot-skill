(function () {
  'use strict';
  const YB = window.YB = {};

  YB.FEED_TAGS = {
    admission_information:        '招生信息',
    enrolment_information:        '录取通知',
    initial_test_information:     '初试信息',
    postgraduate_recommendation:  '保研信息',
    retest_information:           '复试信息',
    school_information:           '学校动态',
    special_plan_enrollment:      '专项招生',
    subject_adjust:               '专业调整',
    summer_camp:                  '夏令营',
    transfer_information:         '调剂信息',
  };

  const TAG_STYLE = {
    admission_information:       ['#ede9fe','#6d28d9'],
    enrolment_information:       ['#cffafe','#0e7490'],
    initial_test_information:    ['#f3e8ff','#7e22ce'],
    postgraduate_recommendation: ['#dcfce7','#15803d'],
    retest_information:          ['#fef3c7','#b45309'],
    school_information:          ['#f1f5f9','#475569'],
    special_plan_enrollment:     ['#fee2e2','#b91c1c'],
    subject_adjust:              ['#fef9c3','#78350f'],
    summer_camp:                 ['#d1fae5','#065f46'],
    transfer_information:        ['#dbeafe','#1d4ed8'],
  };

  YB.esc = function (s) {
    if (s == null) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  };

  YB.renderTagChip = function (key) {
    const label = YB.FEED_TAGS[key] || key;
    const [bg, color] = TAG_STYLE[key] || ['#f1f5f9','#475569'];
    return `<span class="tag-chip" style="background:${bg};color:${color}">${YB.esc(label)}</span>`;
  };

  YB.callTool = async function (tool, args) {
    const res = await fetch('/api/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, args }),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error);
    return json.data;
  };

  YB.pollStatus = function (badgeEl, onReady) {
    let called = false;
    async function check() {
      try {
        const j = await (await fetch('/api/status')).json();
        if (j.ready) {
          badgeEl.className = 'badge ready'; badgeEl.textContent = '已连接';
          if (!called) { called = true; onReady && onReady(); }
        } else {
          badgeEl.className = 'badge connecting'; badgeEl.textContent = '连接中…';
          setTimeout(check, 2000);
        }
      } catch {
        badgeEl.className = 'badge error'; badgeEl.textContent = '服务异常';
      }
    }
    check();
  };

  YB.formatDate = function (iso) {
    if (!iso) return '';
    const d = new Date(iso), now = new Date(), diff = now - d;
    if (diff < 60000)       return '刚刚';
    if (diff < 3600000)     return Math.floor(diff / 60000) + ' 分钟前';
    if (diff < 86400000)    return Math.floor(diff / 3600000) + ' 小时前';
    if (diff < 86400000*3)  return Math.floor(diff / 86400000) + ' 天前';
    const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  };

  YB.formatScore = function (v) {
    if (v == null || v === 0 || v === '') return '—';
    return String(v);
  };

  YB.formatNum = function (v) {
    if (v == null || v === '' ) return '—';
    if (v === 0) return '—';
    if (v === '*') return '*';
    return Number(v).toLocaleString('zh-CN');
  };

  YB.showLoading = function (el) {
    el.innerHTML = '<div class="state-loading"><div class="spinner"></div>查询中…</div>';
  };

  YB.showError = function (el, msg) {
    el.innerHTML = `<div class="state-error">查询失败：${YB.esc(msg)}</div>`;
  };

  YB.showEmpty = function (el, msg) {
    el.innerHTML = `<div class="state-empty"><div class="state-empty-icon">🔍</div><p>${YB.esc(msg || '未找到相关数据')}</p></div>`;
  };

  /* renderTable(el, rows, colDefs, opts)
     colDefs: [{key, label, fmt(val,row), cls, sortKey}]
     opts:    {sortBy, sortOrder, onSort, emptyMsg} */
  YB.renderTable = function (el, rows, colDefs, opts) {
    opts = opts || {};
    el.innerHTML = '';
    if (!rows || rows.length === 0) { YB.showEmpty(el, opts.emptyMsg); return; }

    const theadCells = colDefs.map(c => {
      let cls = c.sortKey ? 'sortable' : '';
      if (c.sortKey && opts.sortBy === c.sortKey) cls += ' sort-' + opts.sortOrder;
      return `<th class="${cls.trim()}" data-sort="${c.sortKey||''}">${YB.esc(c.label)}</th>`;
    }).join('');

    const tbodyRows = rows.map(row => {
      const cells = colDefs.map(c => {
        let val = c.fmt ? c.fmt(row[c.key], row) : (row[c.key] ?? '—');
        return `<td class="${c.cls||''}">${val}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const wrap = document.createElement('div');
    wrap.className = 'table-wrap';
    wrap.innerHTML = `<table><thead><tr>${theadCells}</tr></thead><tbody>${tbodyRows}</tbody></table>`;
    if (opts.onSort) {
      wrap.querySelectorAll('th.sortable').forEach(th => {
        if (th.dataset.sort) th.addEventListener('click', () => opts.onSort(th.dataset.sort));
      });
    }
    el.appendChild(wrap);
  };

  /* renderPagination(el, pagination, onPage) */
  YB.renderPagination = function (el, pagination, onPage) {
    el.innerHTML = '';
    if (!pagination || pagination.total === 0) return;
    const { page, totalPages, total } = pagination;
    const wrap = document.createElement('div');
    wrap.className = 'pagination';
    wrap.innerHTML = `
      <span class="pagination-info">共 ${total.toLocaleString('zh-CN')} 条，第 ${page} / ${totalPages} 页</span>
      <div class="pagination-btns">
        <button class="btn btn-ghost btn-sm prev-btn" ${page<=1?'disabled':''}>← 上一页</button>
        <button class="btn btn-ghost btn-sm next-btn" ${page>=totalPages?'disabled':''}>下一页 →</button>
      </div>`;
    wrap.querySelector('.prev-btn').addEventListener('click', () => { if (page > 1) onPage(page-1); });
    wrap.querySelector('.next-btn').addEventListener('click', () => { if (page < totalPages) onPage(page+1); });
    el.appendChild(wrap);
  };

  /* debounce helper */
  YB.debounce = function (fn, ms) {
    let t; return function (...a) { clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms); };
  };
})();
