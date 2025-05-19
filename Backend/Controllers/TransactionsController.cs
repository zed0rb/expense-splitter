using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.DTOs.Requests;
using Backend.DTOs.Responses;
using Backend.Services;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/groups/{groupId}/transactions")]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public TransactionsController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        [HttpGet]
        public async Task<ActionResult<List<TransactionResponse>>> GetTransactions(Guid groupId)
        {
            var transactions = await _transactionService.GetTransactions(groupId);
            return Ok(transactions.Select(MapToResponse));
        }

        [HttpPost]
        public async Task<ActionResult<TransactionResponse>> CreateTransaction(
            Guid groupId, [FromBody] CreateTransactionRequest request)
        {
            try
            {
                var transaction = await _transactionService.CreateTransaction(groupId, request);
                var response = MapToResponse(transaction);
                return CreatedAtAction(
                    nameof(GetTransactions),
                    new { groupId = groupId },
                    response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private TransactionResponse MapToResponse(Transaction transaction)
        {
            return new TransactionResponse
            {
                Id = transaction.Id,
                Amount = transaction.Amount,
                Description = transaction.Description,
                Date = transaction.Date,
                PaidBy = new MemberResponse
                {
                    Id = transaction.PaidById,
                    Name = transaction.PaidBy.Name,
                    IsCreator = false
                },
                Splits = transaction.Splits.Select(s => new SplitDetail
                {
                    MemberId = s.MemberId,
                    MemberName = s.Member.Name,
                    Amount = s.Amount
                }).ToList()
            };
        }
    }
}
