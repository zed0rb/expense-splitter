using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Group> Groups { get; set; }
        public DbSet<Member> Members { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<TransactionSplit> TransactionSplits { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Member>()
                .HasIndex(m => new { m.GroupId, m.Name })
                .IsUnique();

            modelBuilder.Entity<TransactionSplit>()
                .HasOne(ts => ts.Transaction)
                .WithMany(t => t.Splits)
                .HasForeignKey(ts => ts.TransactionId);

            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.PaidBy)
                .WithMany(m => m.PaidTransactions)
                .HasForeignKey(t => t.PaidById)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.Group)
                .WithMany(g => g.Transactions)
                .HasForeignKey(t => t.GroupId);

            modelBuilder.Entity<Group>()
                .HasOne(g => g.Creator)
                .WithOne()
                .HasForeignKey<Group>(g => g.CreatorId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
