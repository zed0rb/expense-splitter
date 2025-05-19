using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Data;
using Backend.Models;
using Backend.DTOs.Requests;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly AppDbContext _context;
        private const decimal Tolerance = 0.001m;

        public TransactionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Transaction> CreateTransaction(Guid groupId, CreateTransactionRequest request)
        {
            var validationResult = await ValidateTransactionRequest(groupId, request);
            var transaction = InitializeTransaction(groupId, request);

            if (request.Splits?.Any() == true)
            {
                AddCustomSplits(transaction, validationResult.group, request);
            }
            else
            {
                AddEqualSplits(transaction, validationResult.group);
            }

            await _context.Transactions.AddAsync(transaction);
            await _context.SaveChangesAsync();

            return transaction;
        }

        public async Task<List<Transaction>> GetTransactions(Guid groupId)
        {
            return await _context.Transactions
                .Include(t => t.PaidBy)
                .Include(t => t.Splits)
                    .ThenInclude(s => s.Member)
                .Where(t => t.GroupId == groupId)
                .OrderByDescending(t => t.Date)
                .ToListAsync();
        }

        public async Task<Dictionary<Guid, decimal>> CalculateBalances(Guid groupId)
        {
            var group = await _context.Groups
                .Include(g => g.Members)
                .Include(g => g.Transactions)
                    .ThenInclude(t => t.Splits)
                .FirstOrDefaultAsync(g => g.Id == groupId)
                ?? throw new Exception("Group not found");

            var balances = new Dictionary<Guid, decimal>();
            foreach (var member in group.Members)
            {
                balances[member.Id] = 0m;
                foreach (var transaction in group.Transactions)
                {
                    if (transaction.PaidById == member.Id)
                    {
                        balances[member.Id] += transaction.Amount;
                    }
                    balances[member.Id] -= transaction.Splits
                        .Where(s => s.MemberId == member.Id)
                        .Sum(s => s.Amount);
                }
            }

            return balances;
        }

        #region Private Methods

        private async Task<(Group group, Member payer)> ValidateTransactionRequest(Guid groupId, CreateTransactionRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Description))
                throw new Exception("Description is required");

            if (request.Amount <= 0)
                throw new Exception("Amount must be positive");

            var group = await _context.Groups
                .Include(g => g.Members)
                .FirstOrDefaultAsync(g => g.Id == groupId)
                ?? throw new Exception("Group not found");

            var payer = group.Members.FirstOrDefault(m => m.Id == request.PaidById)
                ?? throw new Exception("Payer not found in group");

            return (group, payer);
        }

        private Transaction InitializeTransaction(Guid groupId, CreateTransactionRequest request)
        {
            return new Transaction
            {
                GroupId = groupId,
                PaidById = request.PaidById,
                Amount = request.Amount,
                Description = request.Description,
                Date = DateTime.UtcNow,
                Splits = new List<TransactionSplit>()
            };
        }

        private void AddCustomSplits(Transaction transaction, Group group, CreateTransactionRequest request)
        {
            // Validate all members exist in group
            var invalidMembers = request.Splits.Keys
                .Where(memberId => !group.Members.Any(m => m.Id == memberId))
                .ToList();

            if (invalidMembers.Any())
                throw new Exception($"Invalid members: {string.Join(", ", invalidMembers)}");

            // Calculate total of non-payer splits
            var othersTotal = request.Splits
                .Where(s => s.Key != transaction.PaidById)
                .Sum(s => s.Value);

            // Calculate payer's share (what's left after others)
            var payerShare = transaction.Amount - othersTotal;

            // Add all splits (including calculated payer share)
            foreach (var member in group.Members)
            {
                var amount = member.Id == transaction.PaidById
                    ? payerShare
                    : request.Splits.GetValueOrDefault(member.Id, 0);

                transaction.Splits.Add(new TransactionSplit
                {
                    MemberId = member.Id,
                    Amount = amount,
                    TransactionId = transaction.Id
                });
            }

            // Final validation
            if (Math.Abs(transaction.Splits.Sum(s => s.Amount) - transaction.Amount) > Tolerance)
                throw new Exception("Invalid split amounts");
        }

        private void ValidateCustomSplits(Group group, CreateTransactionRequest request)
        {
            var invalidMembers = request.Splits.Keys
                .Where(memberId => !group.Members.Any(m => m.Id == memberId))
                .ToList();

            if (invalidMembers.Any())
                throw new Exception($"Invalid members: {string.Join(", ", invalidMembers)}");

            if (request.Splits.Any(s => s.Value < 0))
                throw new Exception("Negative amounts not allowed");
        }

        private void AddEqualSplits(Transaction transaction, Group group)
        {
            var splitAmount = transaction.Amount / group.Members.Count;
            foreach (var member in group.Members)
            {
                transaction.Splits.Add(new TransactionSplit
                {
                    MemberId = member.Id,
                    Amount = splitAmount,
                    TransactionId = transaction.Id
                });
            }
        }

        #endregion
    }
}
