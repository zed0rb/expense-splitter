using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.DTOs.Requests;
using Backend.DTOs.Responses;
using Backend.Services;
using Backend.Models;
using Backend.Mapping;
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
            return Ok(transactions.Select(TransactionMapper.MapToResponse));
        }

        [HttpPost]
        public async Task<ActionResult<TransactionResponse>> CreateTransaction(
            Guid groupId, [FromBody] CreateTransactionRequest request)
        {
            try
            {
                var transaction = await _transactionService.CreateTransaction(groupId, request);
                var response = TransactionMapper.MapToResponse(transaction);
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
    }
}
