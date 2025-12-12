import prisma from '../lib/prisma.js';
import path from "path";
import fs from "fs/promises";

async function safeDelete(filePath) {
  try {
    const absolute = path.resolve(filePath);
    await fs.unlink(absolute);
  } catch (e) {
    console.warn(`Could not delete file ${filePath}:`, e.message);
  }
}

function toNumber(val) {
  if (val === undefined || val === null || val === "") return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

export const createLenderKYC = async ({
  userId,
  aadhar_number,
  pan_number,
  aadharPath,
  panPath,
  available_funds,
  interest_rate,
}) => {
  const existing = await prisma.lenderProfile.findUnique({
    where: { userId },
    select: { aadhar_image_path: true, pan_image_path: true },
  });

  if (existing) {
    if (aadharPath && existing.aadhar_image_path && existing.aadhar_image_path !== aadharPath) {
      await safeDelete(existing.aadhar_image_path);
    }
    if (panPath && existing.pan_image_path && existing.pan_image_path !== panPath) {
      await safeDelete(existing.pan_image_path);
    }
  }

  const data = {
    userId,
    aadhar_number: aadhar_number ?? null,
    pan_number: pan_number ?? null,
    aadhar_image_path: aadharPath ?? null,
    pan_image_path: panPath ?? null,
    available_funds: toNumber(available_funds),
    interest_rate: toNumber(interest_rate),
    kyc_status: "pending",
  };

  const record = await prisma.lenderProfile.upsert({
    where: { userId },
    create: data,
    update: {
      aadhar_number: data.aadhar_number ?? undefined,
      pan_number: data.pan_number ?? undefined,
      aadhar_image_path: data.aadhar_image_path ?? undefined,
      pan_image_path: data.pan_image_path ?? undefined,
      available_funds: data.available_funds,
      interest_rate: data.interest_rate,
      kyc_status: "pending",
      updated_at: new Date(),
    },
  });

  return [record];
};

export const getAllPendingLenderKYC = async () => {
  const rows = await prisma.lenderProfile.findMany({
    where: { kyc_status: "pending" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
        }
      }
    },
    orderBy: { created_at: 'desc' }
  });
  
  // Flatten the response to include user fields directly
  // Note: LenderProfile doesn't have full_name, so we use user.name
  return rows.map(row => ({
    ...row,
    userId: row.userId,
    full_name: row.user?.name || '',
    email: row.user?.email || '',
    contact_number: row.user?.phone || '',
    aadhaar_number: row.aadhar_number || '', // Map aadhar_number to aadhaar_number for consistency
    pan_number: row.pan_number || '',
    aadhaar_image: row.aadhar_image_path || '', // Map for consistency
    pan_image: row.pan_image_path || '', // Map for consistency
  }));
};

export const updateLenderKYC = async (id, status) => {
  // This function accepts profile id (not userId)
  const record = await prisma.lenderProfile.update({
    where: { id: Number(id) },
    data: { kyc_status: status, updated_at: new Date() },
  });
  return [record];
};

// Alternative function that accepts userId
export const updateLenderKYCByUserId = async (userId, status) => {
  const record = await prisma.lenderProfile.update({
    where: { userId: Number(userId) },
    data: { kyc_status: status, updated_at: new Date() },
  });
  return [record];
};