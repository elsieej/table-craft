import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { SearchableSelect } from '../components/searchable-select'
import type { Option } from '../types/table'

const options: Option[] = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Bravo', value: 'bravo' },
  { label: 'Charlie', value: 'charlie' },
]

async function openPopover() {
  fireEvent.click(screen.getByRole('combobox'))
  await screen.findByPlaceholderText('Search...')
}

describe('SearchableSelect', () => {
  it('shows the default "All" label as trigger text when value is empty', () => {
    render(<SearchableSelect value="" onValueChange={vi.fn()} options={options} />)
    expect(screen.getByRole('combobox')).toHaveTextContent('All')
  })

  it('shows a custom placeholder as trigger text when value is empty', () => {
    render(
      <SearchableSelect value="" onValueChange={vi.fn()} options={options} placeholder="Pick one" />
    )
    expect(screen.getByRole('combobox')).toHaveTextContent('Pick one')
  })

  it('shows the selected option label as trigger text when value matches an option', () => {
    render(<SearchableSelect value="bravo" onValueChange={vi.fn()} options={options} />)
    expect(screen.getByRole('combobox')).toHaveTextContent('Bravo')
  })

  it('opens the popover and shows "All" plus every option', async () => {
    render(<SearchableSelect value="" onValueChange={vi.fn()} options={options} />)

    await openPopover()

    expect(screen.getByRole('option', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Alpha' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Bravo' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Charlie' })).toBeInTheDocument()
  })

  it('selecting an option calls onValueChange with its value and closes the popover', async () => {
    const onValueChange = vi.fn()
    render(<SearchableSelect value="" onValueChange={onValueChange} options={options} />)

    await openPopover()
    fireEvent.click(screen.getByRole('option', { name: 'Alpha' }))

    expect(onValueChange).toHaveBeenCalledWith('alpha')
    await waitFor(() =>
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
    )
  })

  it('selecting the already-selected option toggles it off', async () => {
    const onValueChange = vi.fn()
    render(<SearchableSelect value="alpha" onValueChange={onValueChange} options={options} />)

    await openPopover()
    fireEvent.click(screen.getByRole('option', { name: 'Alpha' }))

    expect(onValueChange).toHaveBeenCalledWith('')
  })

  it('clicking "All" clears the selection and closes the popover', async () => {
    const onValueChange = vi.fn()
    render(<SearchableSelect value="bravo" onValueChange={onValueChange} options={options} />)

    await openPopover()
    fireEvent.click(screen.getByRole('option', { name: 'All' }))

    expect(onValueChange).toHaveBeenCalledWith('')
    await waitFor(() =>
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
    )
  })

  it('typing in the search input filters non-matching options out of the DOM', async () => {
    render(<SearchableSelect value="" onValueChange={vi.fn()} options={options} />)

    await openPopover()
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'Bravo' } })

    await waitFor(() =>
      expect(screen.queryByRole('option', { name: 'Alpha' })).not.toBeInTheDocument()
    )
    expect(screen.getByRole('option', { name: 'Bravo' })).toBeInTheDocument()
  })

  it('shows a custom empty state when the search matches nothing', async () => {
    render(
      <SearchableSelect value="" onValueChange={vi.fn()} options={options} emptyText="Nothing here" />
    )

    await openPopover()
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'zzz-no-match' } })

    await waitFor(() => expect(screen.getByText('Nothing here')).toBeInTheDocument())
  })

  it('shows the default empty state when emptyText is omitted', async () => {
    render(<SearchableSelect value="" onValueChange={vi.fn()} options={options} />)

    await openPopover()
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'zzz-no-match' } })

    await waitFor(() => expect(screen.getByText('No items found.')).toBeInTheDocument())
  })

  it('disables the trigger and prevents the popover from opening', () => {
    render(<SearchableSelect value="" onValueChange={vi.fn()} options={options} disabled />)

    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeDisabled()

    fireEvent.click(trigger)
    expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument()
  })

  it('uses renderSelected to render the trigger content when a value is selected', () => {
    render(
      <SearchableSelect
        value="bravo"
        onValueChange={vi.fn()}
        options={options}
        renderSelected={(option) => <span data-testid="custom-selected">Custom: {option?.label}</span>}
      />
    )

    expect(screen.getByTestId('custom-selected')).toHaveTextContent('Custom: Bravo')
  })

  it('ignores renderSelected when nothing is selected, falling back to the placeholder', () => {
    render(
      <SearchableSelect
        value=""
        onValueChange={vi.fn()}
        options={options}
        placeholder="Pick one"
        renderSelected={() => <span data-testid="custom-selected">should not render</span>}
      />
    )

    expect(screen.queryByTestId('custom-selected')).not.toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveTextContent('Pick one')
  })

  it('merges a custom className onto the trigger', () => {
    render(
      <SearchableSelect
        value=""
        onValueChange={vi.fn()}
        options={options}
        className="my-custom-class"
      />
    )

    expect(screen.getByRole('combobox').className).toContain('my-custom-class')
  })
})
