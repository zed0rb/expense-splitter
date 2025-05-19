using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Data;
using Backend.Models;
using Backend.DTOs.Requests;
using Backend.DTOs.Responses;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class GroupService : IGroupService
    {
        private AppDbContext _context;
        private const decimal Tolerance = 0.001m;

        public GroupService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<GroupResponse> CreateGroup(CreateGroupRequest request)
        {
            var group = new Group { Title = request.Title };

            var creator = new Member
            {
                Name = "Group Creator",
                Group = group
            };

            group.Members.Add(creator);
            group.Creator = creator;
            group.CreatorId = creator.Id;

            _context.Groups.Add(group);
            await _context.SaveChangesAsync();

            return MapToGroupResponse(group);
        }

        public async Task<GroupResponse> GetGroupById(Guid id)
        {
            var group = await _context.Groups
                .Include(g => g.Members)
                .Include(g => g.Creator)
                .Include(g => g.Transactions)
                    .ThenInclude(t => t.Splits)
                .FirstOrDefaultAsync(g => g.Id == id);

            return group == null ? null : MapToGroupResponse(group);
        }

        public async Task<List<GroupResponse>> GetGroups()
        {
            var groups = await _context.Groups
                .Include(g => g.Members)
                .Include(g => g.Creator)
                .ToListAsync();

            return groups.Select(MapToGroupResponse).ToList();
        }

        public async Task<MemberResponse> AddMember(Guid groupId, AddMemberRequest request)
        {
            var group = await _context.Groups
                .Include(g => g.Members)
                .FirstOrDefaultAsync(g => g.Id == groupId);

            if (group == null) throw new Exception("Group not found");

            if (group.Members.Any(m => m.Name.Equals(request.Name, StringComparison.OrdinalIgnoreCase)))
                throw new Exception("Member name already exists");

            var member = new Member
            {
                Name = request.Name,
                GroupId = groupId
            };

            _context.Members.Add(member);
            await _context.SaveChangesAsync();

            return new MemberResponse
            {
                Id = member.Id,
                Name = member.Name,
                IsCreator = false
            };
        }

        public async Task<bool> RemoveMember(Guid groupId, Guid memberId)
        {
            var member = await _context.Members
                .FirstOrDefaultAsync(m => m.GroupId == groupId && m.Id == memberId);

            if (member == null) return false;
            if (member.Name == "Group Creator") return false;

            _context.Members.Remove(member);
            await _context.SaveChangesAsync();
            return true;
        }

        private GroupResponse MapToGroupResponse(Group group)
        {
            return new GroupResponse
            {
                Id = group.Id,
                Title = group.Title,
                CreatedAt = group.CreatedAt,
                Creator = new MemberResponse
                {
                    Id = group.CreatorId,
                    Name = group.Creator.Name,
                    IsCreator = true
                },
                Members = group.Members
                    .Where(m => m.Id != group.CreatorId)
                    .Select(m => new MemberResponse
                    {
                        Id = m.Id,
                        Name = m.Name,
                        IsCreator = false
                    }).ToList()
            };
        }
    }
}
