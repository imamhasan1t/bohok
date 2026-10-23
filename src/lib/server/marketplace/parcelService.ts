// BOHOK Phase 8 — Server Parcel Management Service
// Handles parcel request validation, persistence, and state transitions

import { serverDb } from '../db/memoryDb';
import { DbParcel } from '../db/dbTypes';
import { ServerValidator } from '../validation/validator';
import { AuditLogger } from '../audit/auditLogger';

export interface CreateParcelDto {
  originCity: string;
  originArea: string;
  destinationCity: string;
  destinationArea: string;
  category: DbParcel['category'];
  categoryBn: string;
  weightKg: number;
  packageSize: DbParcel['packageSize'];
  packageSizeBn: string;
  description: string;
  urgency?: DbParcel['urgency'];
  urgencyBn?: string;
  recipientName: string;
  recipientPhone: string;
}

export const ServerParcelService = {
  createParcel(senderId: string, dto: CreateParcelDto): DbParcel {
    const weightKg = ServerValidator.validateWeight(dto.weightKg);
    const originCity = ServerValidator.validateRequiredString(dto.originCity, 'originCity', 'প্রস্থান শহর');
    const destinationCity = ServerValidator.validateRequiredString(dto.destinationCity, 'destinationCity', 'গন্তব্য শহর');
    const recipientPhone = ServerValidator.validatePhone(dto.recipientPhone);
    const recipientName = ServerValidator.validateRequiredString(dto.recipientName, 'recipientName', 'প্রাপকের নাম');

    const parcel = serverDb.insertParcel({
      senderId,
      originCity,
      originArea: dto.originArea || `${originCity} পয়েন্ট`,
      destinationCity,
      destinationArea: dto.destinationArea || `${destinationCity} পয়েন্ট`,
      category: dto.category || 'other_permitted',
      categoryBn: dto.categoryBn || 'সাধারণ পার্সেল',
      weightKg,
      packageSize: dto.packageSize || 'small',
      packageSizeBn: dto.packageSizeBn || 'ছোট',
      description: dto.description || 'ব্যক্তিগত পার্সেল',
      urgency: dto.urgency || 'today',
      urgencyBn: dto.urgencyBn || 'আজকে ডেলিভারি',
      recipientName,
      recipientPhone,
    });

    AuditLogger.log({
      actorUserId: senderId,
      entityType: 'parcel',
      entityId: parcel.id,
      eventType: 'BOOKING_CREATED',
      metadata: { route: `${originCity} -> ${destinationCity}`, weightKg },
    });

    return parcel;
  },

  getParcelById(parcelId: string): DbParcel | null {
    return serverDb.parcels.get(parcelId) || null;
  },

  getParcelsBySender(senderId: string): DbParcel[] {
    const list: DbParcel[] = [];
    for (const p of serverDb.parcels.values()) {
      if (p.senderId === senderId) list.push(p);
    }
    return list;
  },
};
