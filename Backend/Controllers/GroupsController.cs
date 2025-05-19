using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.DTOs.Responses;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Backend.DTOs.Requests;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GroupsController : ControllerBase
    {
        private readonly IGroupService _groupService;
        private readonly ITransactionService _transactionService;

        public GroupsController(IGroupService groupService, ITransactionService transactionService)
        {
            _groupService = groupService;
            _transactionService = transactionService;
        }

        [HttpGet]
        public async Task<ActionResult<List<GroupResponse>>> GetGroups()
        {
            return Ok(await _groupService.GetGroups());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<GroupResponse>> GetGroup(Guid id)
        {
            var group = await _groupService.GetGroupById(id);
            return group == null ? NotFound() : Ok(group);
        }

        [HttpPost]
        public async Task<ActionResult<GroupResponse>> CreateGroup([FromBody] CreateGroupRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Title))
                return BadRequest("Title is required");

            var group = await _groupService.CreateGroup(request);
            return CreatedAtAction(nameof(GetGroup), new { id = group.Id }, group);
        }

        [HttpPost("{groupId}/members")]
        public async Task<ActionResult<MemberResponse>> AddMember(Guid groupId, [FromBody] AddMemberRequest request)
        {
            try
            {
                var member = await _groupService.AddMember(groupId, request);
                return CreatedAtAction(nameof(GetGroup), new { id = groupId }, member);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{groupId}/members/{memberId}")]
        public async Task<IActionResult> RemoveMember(Guid groupId, Guid memberId)
        {
            var removed = await _groupService.RemoveMember(groupId, memberId);
            return removed ? NoContent() : NotFound();
        }

        [HttpGet("{groupId}/balances")]
        public async Task<ActionResult<Dictionary<Guid, decimal>>> GetBalances(Guid groupId)
        {
            try
            {
                var balances = await _transactionService.CalculateBalances(groupId);
                return Ok(balances);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
