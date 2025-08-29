import { db } from '../db';
import { countersTable } from '../db/schema';
import { type UpdateCounterInput, type Counter } from '../schema';
import { eq } from 'drizzle-orm';

export const updateCounter = async (input: UpdateCounterInput): Promise<Counter> => {
  try {
    // Get or create the counter (assuming single counter with id = 1)
    let counter = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, 1))
      .limit(1)
      .execute();

    // If no counter exists, create one
    if (counter.length === 0) {
      const newCounter = await db.insert(countersTable)
        .values({
          value: 0
        })
        .returning()
        .execute();
      counter = newCounter;
    }

    const currentValue = counter[0].value;
    let newValue: number;

    // Apply the operation
    switch (input.operation) {
      case 'increment':
        newValue = currentValue + 1;
        break;
      case 'decrement':
        newValue = currentValue - 1;
        break;
      case 'reset':
        newValue = 0;
        break;
    }

    // Update the counter value
    const result = await db.update(countersTable)
      .set({
        value: newValue,
        updated_at: new Date()
      })
      .where(eq(countersTable.id, counter[0].id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Counter update failed:', error);
    throw error;
  }
};