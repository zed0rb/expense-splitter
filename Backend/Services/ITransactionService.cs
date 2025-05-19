using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Models;
using Backend.DTOs.Requests;

namespace Backend.Services
{
    public interface ITransactionService
    {
        Task<Transaction> CreateTransaction(Guid groupId, CreateTransactionRequest request);
        Task<List<Transaction>> GetTransactions(Guid groupId);
        Task<Dictionary<Guid, decimal>> CalculateBalances(Guid groupId);
    }
}
