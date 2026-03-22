/**
 * Map borrower KYC form body to one row compatible with credit_preprocess / train.csv features.
 */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toNum(v, fallback = 0) {
  if (v === undefined || v === null || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function toBool(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const s = v.toLowerCase();
    return s === 'true' || s === 'yes' || s === '1';
  }
  return false;
}

const EMPLOYMENT_TO_OCCUPATION = {
  salaried: 'Teacher',
  self_employed: 'Entrepreneur',
  business_owner: 'Entrepreneur',
  freelancer: 'Scientist',
  unemployed: '_______',
};

/**
 * @param {Record<string, unknown>} body - req.body from multipart KYC submit
 * @returns {Record<string, string|number>}
 */
export function kycPayloadToMlRow(body) {
  const monthlyIncome = toNum(body.monthly_income);
  const annualIncome = monthlyIncome * 12;
  const month = MONTHS[new Date().getMonth()];

  const emp = String(body.employment_type || '').toLowerCase();
  const Occupation = EMPLOYMENT_TO_OCCUPATION[emp] || 'Teacher';

  const hasLoans = toBool(body.previous_loans);
  let Type_of_Loan = 'Not Specified';
  if (hasLoans) {
    const lt = String(body.loan_type || '').toLowerCase();
    if (lt === 'personal') Type_of_Loan = 'Personal Loan';
    else if (lt === 'home') Type_of_Loan = 'Mortgage Loan';
    else if (lt === 'education') Type_of_Loan = 'Student Loan';
    else if (lt === 'credit_card') Type_of_Loan = 'Credit-Builder Loan';
    else Type_of_Loan = 'Personal Loan';
  }

  const ccRepay = String(body.credit_card_repayment_behavior || '').toLowerCase();
  let Payment_of_Min_Amount = 'No';
  if (ccRepay.includes('minimum')) Payment_of_Min_Amount = 'Yes';
  else if (ccRepay.includes('partial')) Payment_of_Min_Amount = 'NM';
  else if (ccRepay.includes('no_credit') || ccRepay.includes('no credit')) Payment_of_Min_Amount = 'No';

  const yearsStab = toNum(body.years_of_job_stability, 1);
  const y = Math.max(1, Math.min(60, Math.floor(yearsStab)));
  const Credit_History_Age = `${y} Years and 0 Months`;

  const missedEmi = toNum(body.missed_emi_payments);
  const missedUtil = toNum(body.missed_utility_payments);
  const delayTotal = missedEmi + missedUtil;

  const outstanding = toNum(body.current_outstanding_loan);
  const creditUtil = annualIncome > 0
    ? Math.min(100, (outstanding / annualIncome) * 100)
    : 0;

  const emi = toNum(body.average_emi_per_month);
  const expenses = toNum(body.approx_monthly_expenses);
  const Monthly_Balance = Math.max(0, monthlyIncome - expenses - emi);

  const saves = toBool(body.maintains_savings_monthly);
  const Amount_invested_monthly = monthlyIncome * (saves ? 0.08 : 0.02);

  const numLoans = hasLoans ? Math.max(1, toNum(body.num_of_active_loans, 1)) : 0;

  const creditMix = String(body.credit_mix || 'Standard').trim() || 'Standard';
  const paymentBehaviour = String(body.payment_behaviour_credit || 'High_spent_Small_value_payments').trim()
    || 'High_spent_Small_value_payments';

  return {
    Month: month,
    Age: toNum(body.age, 25),
    Occupation,
    Annual_Income: annualIncome,
    Monthly_Inhand_Salary: monthlyIncome,
    Num_Bank_Accounts: toNum(body.num_bank_accounts, 2),
    Num_Credit_Card: toNum(body.num_credit_cards, 1),
    Interest_Rate: toNum(body.interest_rate_avg, 12),
    Num_of_Loan: numLoans,
    Type_of_Loan,
    Delay_from_due_date: delayTotal,
    Num_of_Delayed_Payment: delayTotal,
    Changed_Credit_Limit: toNum(body.changed_credit_limit, 10),
    Num_Credit_Inquiries: toNum(body.num_credit_inquiries, 2),
    Credit_Mix: creditMix,
    Outstanding_Debt: outstanding,
    Credit_Utilization_Ratio: creditUtil,
    Credit_History_Age,
    Payment_of_Min_Amount,
    Total_EMI_per_month: emi,
    Amount_invested_monthly: Amount_invested_monthly,
    Payment_Behaviour: paymentBehaviour,
    Monthly_Balance,
  };
}

/**
 * Map model label to platform credit score band (300–900 style) and borrowing flag.
 * @param {string} label - Good | Standard | Poor
 */
export function creditLabelToScoreAndEligibility(label) {
  const normalized = String(label || '').trim();
  let creditScore = 650;
  let canBorrow = true;
  if (normalized === 'Good') {
    creditScore = 780;
    canBorrow = true;
  } else if (normalized === 'Standard') {
    creditScore = 680;
    canBorrow = true;
  } else if (normalized === 'Poor') {
    creditScore = 560;
    canBorrow = false;
  }
  return { creditScore, canBorrow, mlCreditCategory: normalized };
}
