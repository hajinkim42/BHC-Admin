import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

/** 오늘 날짜 기반 테스트 제목 (예: '2026-04-08-Test') */
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const TEST_TITLE = `${yyyy}-${mm}-${dd}-Test`;
const TODAY_STR = `${yyyy}-${mm}-${dd}`; // DatePicker td[title] 용

test.describe('모임 CRUD 전체 흐름', () => {
  test.describe.configure({ mode: 'serial' });

  /** @type {import('@playwright/test').Page} */
  let page;

  test.beforeAll(async ({ browser }) => {
    // 이전 실패로 남은 테스트 데이터 정리
    const { data: leftover } = await supabase
      .from('meetups')
      .select('id')
      .eq('title', TEST_TITLE);

    if (leftover && leftover.length > 0) {
      const ids = leftover.map(m => m.id);
      await supabase.from('meetup_attendees').delete().in('meetup_id', ids);
      await supabase.from('meetups').delete().in('id', ids);
    }

    // 시퀀스 리셋
    await supabase.rpc('reset_meetup_sequences');

    page = await browser.newPage();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.afterAll(async () => {
    await page.close();
  });

  // ─── 헬퍼 함수 ───

  /** Ant Design Select 옵션 선택 */
  async function selectOption(label, optionText) {
    const formItem = page.locator('.ant-form-item').filter({ hasText: label });
    await formItem.locator('.ant-select-selector').click();
    await page
      .locator('.ant-select-dropdown:visible')
      .getByTitle(optionText)
      .click();
  }

  /** Ant Design AutoComplete 에서 옵션 선택 */
  async function autoCompleteSelect(inputLocator, searchText, optionText) {
    await inputLocator.click();
    await inputLocator.fill('');
    await inputLocator.pressSequentially(searchText, { delay: 50 });
    const option = page
      .locator('.ant-select-dropdown:visible')
      .getByTitle(optionText);
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
  }

  // ─── Step 1: 일정 추가 ───

  test('일정 추가 - 모달이 열리고 폼 입력 후 저장된다', async () => {
    // '일정 추가' 버튼 클릭
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 모달 열림 확인
    const modal = page.locator('.ant-modal').filter({ hasText: '일정 추가' });
    await expect(modal).toBeVisible();

    // 제목 입력
    await modal.locator('input#title').fill(TEST_TITLE);

    // 리딩자 선택 (AutoComplete)
    const leaderInput = modal.locator('#leader_nickname');
    await autoCompleteSelect(leaderInput, '김하진', '김하진이찬이2406성동');

    // 날짜 설정 - DatePicker (오늘 날짜 선택)
    const dateInput = modal
      .locator('.ant-picker')
      .filter({ has: page.locator('input#date') });
    await dateInput.click();
    const datePanel = page.locator('.ant-picker-dropdown:visible');
    await datePanel.waitFor({ state: 'visible' });
    await datePanel.locator(`td[title="${TODAY_STR}"]`).click();

    // 시간 설정 - TimePicker
    const timeInput = modal
      .locator('.ant-picker')
      .filter({ has: page.locator('input#start_time') });
    await timeInput.click();
    const timePanel = page.locator('.ant-picker-dropdown:visible');
    await timePanel.waitFor({ state: 'visible' });

    // 09시 선택
    const hourColumn = timePanel
      .locator('.ant-picker-time-panel-column')
      .nth(0);
    await hourColumn.locator('li').filter({ hasText: /^09$/ }).click();

    // 40분 선택
    const minuteColumn = timePanel
      .locator('.ant-picker-time-panel-column')
      .nth(1);
    await minuteColumn.locator('li').filter({ hasText: /^40$/ }).click();

    // TimePicker 확인 버튼
    await timePanel.getByRole('button', { name: /확인|OK/i }).click();

    // 활동 유형 선택
    await selectOption('활동 유형', '정기모임');

    // 난이도 선택
    await selectOption('난이도', '초급');

    // 모임 진행 상태 기본값 확인
    const statusSelect = modal
      .locator('.ant-form-item')
      .filter({ hasText: '모임 진행 상태' })
      .locator('.ant-select-selection-item');
    await expect(statusSelect).toHaveText('진행 전');

    // 저장
    await modal.getByRole('button', { name: '저장' }).click();

    // 성공 메시지 확인
    await expect(page.locator('.ant-message')).toContainText('추가', {
      timeout: 10000,
    });

    // 모달 닫힘 확인
    await expect(modal).toBeHidden({ timeout: 10000 });
  });

  // ─── Step 2: 모임 상태 변경 ───

  test('모임 상태를 완료로 변경하면 참가자 명단과 소감 필드가 나타난다', async () => {
    // '주' 뷰로 전환하여 오늘 이벤트를 정확히 클릭
    await page.getByRole('button', { name: '주' }).click();
    await page.waitForTimeout(500);

    // 주 뷰에서 테스트 이벤트 클릭
    await page
      .locator('.rbc-event-content')
      .filter({ hasText: TEST_TITLE })
      .last()
      .click();

    // 수정 모달 열림 확인
    const modal = page.locator('.ant-modal').filter({ hasText: '일정 수정' });
    await expect(modal).toBeVisible();

    // 참가자 명단 필드가 아직 없는지 확인
    await expect(modal.getByText('참가자 명단')).toBeHidden();

    // 소감 필드가 아직 없는지 확인
    await expect(
      modal.locator('label').filter({ hasText: '소감' })
    ).toBeHidden();

    // 모임 진행 상태를 '완료'로 변경
    await selectOption('모임 진행 상태', '완료');

    // 참가자 명단 필드 노출 확인
    await expect(modal.getByText('참가자 명단')).toBeVisible();

    // 소감 필드 노출 확인
    await expect(
      modal.locator('label').filter({ hasText: '소감' })
    ).toBeVisible();
  });

  // ─── Step 3: 참가자 추가 ───

  test('참가자 3명을 추가한다', async () => {
    const modal = page.locator('.ant-modal').filter({ hasText: '일정 수정' });

    const attendeeSection = modal
      .locator('.ant-form-item')
      .filter({ hasText: '참가자 명단' });
    const attendeeInput = attendeeSection.locator(
      '.ant-select-auto-complete input'
    );

    // 참가자 1
    await autoCompleteSelect(attendeeInput, '김지영', '김지영강다경2404중구');
    await expect(modal.getByText('김지영강다경2404중구')).toBeVisible();

    // 참가자 2
    await autoCompleteSelect(attendeeInput, '홍윤희', '홍윤희이나우2401서대');
    await expect(modal.getByText('홍윤희이나우2401서대')).toBeVisible();

    // 참가자 3
    await autoCompleteSelect(attendeeInput, '오언주', '오언주인주호2402강북');
    await expect(modal.getByText('오언주인주호2402강북')).toBeVisible();
  });

  // ─── Step 4: 참가자 삭제 ───

  test('참가자 김지영강다경2404중구 를 삭제한다', async () => {
    const modal = page.locator('.ant-modal').filter({ hasText: '일정 수정' });

    const attendeeItem = modal
      .locator('.ant-list-item')
      .filter({ hasText: '김지영강다경2404중구' });
    await attendeeItem.getByRole('button', { name: '삭제' }).click();

    // 목록에서 사라짐
    await expect(
      modal
        .locator('.ant-list-item')
        .filter({ hasText: '김지영강다경2404중구' })
    ).toBeHidden();

    // 나머지 2명 유지
    await expect(modal.getByText('홍윤희이나우2401서대')).toBeVisible();
    await expect(modal.getByText('오언주인주호2402강북')).toBeVisible();
  });

  // ─── Step 5: 저장 ───

  test('저장 버튼 클릭 시 저장된다', async () => {
    const modal = page.locator('.ant-modal').filter({ hasText: '일정 수정' });

    await modal.getByRole('button', { name: '저장' }).click();

    // 성공 메시지 확인
    await expect(page.locator('.ant-message')).toContainText('수정', {
      timeout: 10000,
    });

    // 모달 닫힘으로 저장 성공 확인
    await expect(modal).toBeHidden({ timeout: 10000 });
  });

  // ─── Step 6: 삭제 ───

  test('삭제 버튼 클릭 시 확인 팝업 후 삭제된다', async () => {
    // '주' 뷰에서 테스트 이벤트 클릭
    await page
      .locator('.rbc-event-content')
      .filter({ hasText: TEST_TITLE })
      .last()
      .click();

    // 수정 모달 열림 확인
    const modal = page.locator('.ant-modal').filter({ hasText: '일정 수정' });
    await expect(modal).toBeVisible();

    // 삭제 버튼 클릭
    await modal.getByRole('button', { name: '삭제' }).last().click();

    // '일정을 삭제하시겠습니까?' 팝업 노출 확인
    const confirmModal = page.locator('.ant-modal-confirm');
    await expect(confirmModal).toBeVisible();
    await expect(
      confirmModal.getByText('일정을 삭제하시겠습니까?')
    ).toBeVisible();

    // 확인(삭제) 클릭
    await confirmModal.getByRole('button', { name: '삭제' }).click();

    // 성공 메시지 확인
    await expect(page.locator('.ant-message')).toContainText('삭제', {
      timeout: 10000,
    });

    // 모달 닫힘 확인
    await expect(modal).toBeHidden({ timeout: 10000 });

    // 테스트 이벤트가 캘린더에서 사라짐 확인
    await expect(
      page.locator('.rbc-event-content').filter({ hasText: TEST_TITLE })
    ).toHaveCount(0, { timeout: 10000 });
  });
});
