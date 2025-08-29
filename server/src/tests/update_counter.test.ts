import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type UpdateCounterInput } from '../schema';
import { updateCounter } from '../handlers/update_counter';
import { eq } from 'drizzle-orm';

describe('updateCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create counter and increment from 0 to 1', async () => {
    const input: UpdateCounterInput = {
      operation: 'increment'
    };

    const result = await updateCounter(input);

    expect(result.value).toEqual(1);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should increment existing counter value', async () => {
    // Create initial counter
    await db.insert(countersTable)
      .values({ value: 5 })
      .execute();

    const input: UpdateCounterInput = {
      operation: 'increment'
    };

    const result = await updateCounter(input);

    expect(result.value).toEqual(6);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should decrement counter value', async () => {
    // Create initial counter
    await db.insert(countersTable)
      .values({ value: 10 })
      .execute();

    const input: UpdateCounterInput = {
      operation: 'decrement'
    };

    const result = await updateCounter(input);

    expect(result.value).toEqual(9);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create counter and decrement from 0 to -1', async () => {
    const input: UpdateCounterInput = {
      operation: 'decrement'
    };

    const result = await updateCounter(input);

    expect(result.value).toEqual(-1);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should reset counter value to 0', async () => {
    // Create initial counter with non-zero value
    await db.insert(countersTable)
      .values({ value: 42 })
      .execute();

    const input: UpdateCounterInput = {
      operation: 'reset'
    };

    const result = await updateCounter(input);

    expect(result.value).toEqual(0);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create counter and reset to 0 when no counter exists', async () => {
    const input: UpdateCounterInput = {
      operation: 'reset'
    };

    const result = await updateCounter(input);

    expect(result.value).toEqual(0);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save updated counter to database', async () => {
    const input: UpdateCounterInput = {
      operation: 'increment'
    };

    const result = await updateCounter(input);

    // Verify data is actually saved in database
    const counters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, result.id))
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].value).toEqual(1);
    expect(counters[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle multiple operations in sequence', async () => {
    // Start with increment
    await updateCounter({ operation: 'increment' });
    
    // Increment again
    await updateCounter({ operation: 'increment' });
    
    // Decrement once
    const result = await updateCounter({ operation: 'decrement' });

    expect(result.value).toEqual(1);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update timestamp on each operation', async () => {
    // First operation
    const firstResult = await updateCounter({ operation: 'increment' });
    const firstTimestamp = firstResult.updated_at;

    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    // Second operation
    const secondResult = await updateCounter({ operation: 'increment' });
    const secondTimestamp = secondResult.updated_at;

    expect(secondTimestamp.getTime()).toBeGreaterThan(firstTimestamp.getTime());
    expect(secondResult.value).toEqual(2);
  });
});