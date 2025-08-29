import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { getCounter } from '../handlers/get_counter';

describe('getCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a new counter with value 0 when no counter exists', async () => {
    const result = await getCounter();

    // Verify the returned counter
    expect(result.id).toBeDefined();
    expect(result.value).toEqual(0);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify it was saved to the database
    const counters = await db.select()
      .from(countersTable)
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].id).toEqual(result.id);
    expect(counters[0].value).toEqual(0);
    expect(counters[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return existing counter when one exists', async () => {
    // Create a counter with value 5
    const existingCounter = await db.insert(countersTable)
      .values({
        value: 5
      })
      .returning()
      .execute();

    const result = await getCounter();

    // Should return the existing counter
    expect(result.id).toEqual(existingCounter[0].id);
    expect(result.value).toEqual(5);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should return the first counter when multiple exist', async () => {
    // Create multiple counters
    const firstCounter = await db.insert(countersTable)
      .values({
        value: 10
      })
      .returning()
      .execute();

    await db.insert(countersTable)
      .values({
        value: 20
      })
      .execute();

    const result = await getCounter();

    // Should return the first counter (lowest ID)
    expect(result.id).toEqual(firstCounter[0].id);
    expect(result.value).toEqual(10);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should handle database being empty initially', async () => {
    // Verify no counters exist initially
    const initialCounters = await db.select()
      .from(countersTable)
      .execute();
    
    expect(initialCounters).toHaveLength(0);

    const result = await getCounter();

    // Should create and return a new counter
    expect(result.id).toBeDefined();
    expect(result.value).toEqual(0);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify exactly one counter now exists
    const finalCounters = await db.select()
      .from(countersTable)
      .execute();
    
    expect(finalCounters).toHaveLength(1);
  });

  it('should preserve counter updated_at timestamp', async () => {
    // Create a counter with a specific timestamp
    const specificDate = new Date('2023-01-01T00:00:00Z');
    await db.insert(countersTable)
      .values({
        value: 42,
        updated_at: specificDate
      })
      .execute();

    const result = await getCounter();

    // Should return the counter with preserved timestamp
    expect(result.value).toEqual(42);
    expect(result.updated_at).toEqual(specificDate);
  });
});