import { describe, it, expect, vi } from 'vitest'
import { listJpegFiles, generateFolderId } from '../lib/fileSystem'

describe('generateFolderId', () => {
  it('returns a stable id for the same folder name', () => {
    const id1 = generateFolderId('Nepal 2024')
    const id2 = generateFolderId('Nepal 2024')
    expect(id1).toBe(id2)
  })

  it('returns different ids for different folder names', () => {
    expect(generateFolderId('Nepal 2024')).not.toBe(generateFolderId('Niagara 2025'))
  })
})

describe('listJpegFiles', () => {
  it('returns only .jpg and .jpeg files', async () => {
    const mockHandle = {
      values: vi.fn().mockReturnValue(
        (async function* () {
          yield { kind: 'file', name: 'DSC001.jpg', getFile: vi.fn() }
          yield { kind: 'file', name: 'DSC002.JPG', getFile: vi.fn() }
          yield { kind: 'file', name: 'DSC003.cr3', getFile: vi.fn() }
          yield { kind: 'file', name: '.DS_Store', getFile: vi.fn() }
          yield { kind: 'directory', name: 'subdir' }
        })()
      ),
    } as unknown as FileSystemDirectoryHandle

    const files = await listJpegFiles(mockHandle)
    expect(files).toHaveLength(2)
    expect(files.map(f => f.name)).toEqual(['DSC001.jpg', 'DSC002.JPG'])
  })
})
